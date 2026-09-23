'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

import { executeLeadImport } from './leads'
import { executePropertyImport } from './properties'

import type {
  ImportActionState,
  ImportColumnMapping,
  ImportRow,
  ImportType,
} from './types'

export async function createImportJob(
  type: ImportType,
  fileName: string,
  mapping: ImportColumnMapping,
): Promise<ImportActionState> {
  try {
    const supabase = await createClient()

    const { data: tenant, error: tenantError } =
      await supabase.rpc('crm_current_tenant_id')

    if (tenantError || !tenant) {
      return {
        ok: false,
        message:
          tenantError?.message ??
          'Unable to resolve the current tenant.',
      }
    }

    const { data: user } =
      await supabase.auth.getUser()

    const {
      data,
      error,
    } = await supabase
      .from('crm_import_jobs')
      .insert({
        tenant_id: tenant,
        file_name: fileName,
        import_type: type,
        column_mapping: mapping,
        created_by: user.user?.id ?? null,
      })
      .select('id')
      .single()

    if (error) {
      return {
        ok: false,
        message: error.message,
      }
    }

    revalidatePath('/dashboard/imports')

    return {
      ok: true,
      message: 'Import created.',
      importJobId: data.id,
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to create import.',
    }
  }
}

export async function executeImport(
  importJobId: string,
  type: ImportType,
  rows: ImportRow[],
  mapping: ImportColumnMapping,
): Promise<ImportActionState> {
  try {
    const supabase = await createClient()

    const {
      data: job,
      error: jobError,
    } = await supabase
      .from('crm_import_jobs')
      .select(
        'id, tenant_id, workspace_id, import_type, status',
      )
      .eq('id', importJobId)
      .single()

    if (jobError || !job) {
      return {
        ok: false,
        message:
          jobError?.message ??
          'Import job was not found.',
      }
    }

    if (job.import_type !== type) {
      return {
        ok: false,
        message:
          'The selected import type does not match the import job.',
      }
    }

    if (
      job.status !== 'ready' &&
      job.status !== 'uploaded'
    ) {
      return {
        ok: false,
        message:
          'This import is no longer ready to run.',
      }
    }

    const {
      error: processingError,
    } = await supabase
      .from('crm_import_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
      })
      .eq('id', importJobId)

    if (processingError) {
      return {
        ok: false,
        message:
          processingError.message,
      }
    }

    const result =
      type === 'leads'
        ? await executeLeadImport(
            supabase,
            rows,
            mapping,
            job.tenant_id,
            job.workspace_id,
          )
        : await executePropertyImport(
            supabase,
            rows,
            mapping,
          )

    const status =
      result.failedRows > 0
        ? 'completed_with_errors'
        : 'completed'

    const {
      error: completionError,
    } = await supabase
      .from('crm_import_jobs')
      .update({
        status,
        total_rows: rows.length,
        valid_rows:
          rows.length - result.failedRows,
        invalid_rows: result.failedRows,
        imported_rows: result.importedRows,
        skipped_rows: result.skippedRows,
        error_summary: result.issues,
        completed_at:
          new Date().toISOString(),
      })
      .eq('id', importJobId)

    if (completionError) {
      return {
        ok: false,
        message:
          completionError.message,
        importJobId,
        importedRows:
          result.importedRows,
        skippedRows:
          result.skippedRows,
        failedRows:
          result.failedRows,
        issues: result.issues,
        projectsCreated:
          result.projectsCreated,
        configurationsCreated:
          result.configurationsCreated,
        unitsCreated:
          result.unitsCreated,
      }
    }

    revalidatePath('/dashboard/imports')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/projects')

    return {
      ok: true,
      message:
        type === 'properties'
          ? `Property import completed. ${result.unitsCreated ?? 0} units created.`
          : `Lead import completed. ${result.importedRows} leads imported.`,
      importJobId,
      importedRows:
        result.importedRows,
      skippedRows:
        result.skippedRows,
      failedRows:
        result.failedRows,
      issues: result.issues,
      projectsCreated:
        result.projectsCreated,
      configurationsCreated:
        result.configurationsCreated,
      unitsCreated:
        result.unitsCreated,
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to execute import.',
      importJobId,
    }
  }
}