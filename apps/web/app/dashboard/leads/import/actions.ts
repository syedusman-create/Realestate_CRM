'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../../lib/supabase/server'

export type LeadImportState = {
  ok: boolean
  message: string
  imported: number
  failed: number
}

const initialState: LeadImportState = { ok: true, message: '', imported: 0, failed: 0 }

export async function importLeads(_: LeadImportState = initialState, formData: FormData): Promise<LeadImportState> {
  try {
    const raw = String(formData.get('rows') ?? '')
    if (!raw) return { ...initialState, ok: false, message: 'No rows were provided.' }

    let rows: unknown
    try { rows = JSON.parse(raw) } catch { return { ...initialState, ok: false, message: 'Import data is not valid JSON.' } }
    if (!Array.isArray(rows) || rows.length === 0) return { ...initialState, ok: false, message: 'Add at least one lead row.' }
    if (rows.length > 5000) return { ...initialState, ok: false, message: 'Maximum 5,000 leads per import.' }
    if (rows.some((row) => !row || typeof row !== 'object' || Array.isArray(row))) return { ...initialState, ok: false, message: 'Every import row must be an object.' }

    const supabase = await createClient()
    const { data: claims } = await supabase.auth.getClaims()
    if (!claims?.claims.sub) return { ...initialState, ok: false, message: 'Authentication required.' }

    const workspaceId = String(formData.get('workspace_id') ?? '').trim() || null
    const { data, error } = await supabase.rpc('bulk_ingest_leads', {
      p_rows: rows,
      p_workspace_id: workspaceId,
    })
    if (error) return { ...initialState, ok: false, message: error.message }

    const results = Array.isArray(data) ? data as { ok?: boolean }[] : []
    const imported = results.filter((result) => result.ok === true).length
    const failed = results.length - imported
    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard')
    return {
      ok: failed === 0,
      message: failed === 0 ? `${imported} leads imported successfully.` : `${imported} imported, ${failed} failed. Review the row errors below and retry the failed records.`,
      imported,
      failed,
    }
  } catch (error) {
    return { ...initialState, ok: false, message: error instanceof Error ? error.message : 'Unable to import leads.' }
  }
}
