'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

import type { TeamActionState } from './types'

function textValue(
  formData: FormData,
  field: string,
): string {
  return String(
    formData.get(field) ?? '',
  ).trim()
}

function optionalValue(
  formData: FormData,
  field: string,
): string | null {
  const value = textValue(formData, field)

  return value || null
}

function validateRole(
  role: string,
): string {
  const normalized = role.trim().toLowerCase()

  if (!normalized) {
    throw new Error('Role is required.')
  }

  return normalized
}

async function getCurrentTenantCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string> {
  const {
    data: tenantId,
    error: tenantError,
  } = await supabase.rpc(
    'crm_current_tenant_id',
  )

  if (tenantError) {
    throw new Error(
      `Unable to resolve current tenant: ${tenantError.message}`,
    )
  }

  if (!tenantId) {
    throw new Error(
      'No current tenant is available.',
    )
  }

  const {
    data: tenant,
    error,
  } = await supabase
    .from('tenants')
    .select('tenant_code')
    .eq('id', tenantId)
    .single()

  if (error) {
    throw new Error(
      `Unable to load current tenant: ${error.message}`,
    )
  }

  if (!tenant?.tenant_code) {
    throw new Error(
      'Current tenant does not have a tenant code.',
    )
  }

  return tenant.tenant_code
}

async function requireAuthenticatedUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error(
      'You must be signed in to manage team members.',
    )
  }

  return user
}

export async function createTeamMember(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  try {
    const supabase = await createClient()

    await requireAuthenticatedUser(
      supabase,
    )

    const tenantCode =
      await getCurrentTenantCode(
        supabase,
      )

    const fullName = textValue(
      formData,
      'full_name',
    )

    const email = optionalValue(
      formData,
      'email',
    )

    const phone = optionalValue(
      formData,
      'phone',
    )

    const role = validateRole(
      textValue(formData, 'role'),
    )

    const workspaceId = optionalValue(
      formData,
      'workspace_id',
    )

    if (!fullName) {
      return {
        ok: false,
        message: 'Full name is required.',
      }
    }

    const {
      data,
      error,
    } = await supabase
      .from('users')
      .insert({
        tenant_code: tenantCode,
        full_name: fullName,
        email,
        phone,
        role,
        is_active: true,
        workspace_id: workspaceId,
      })
      .select('id')
      .single()

    if (error) {
      return {
        ok: false,
        message: `Unable to create team member: ${error.message}`,
      }
    }

    revalidatePath(
      '/dashboard/team',
    )

    return {
      ok: true,
      message:
        'Team member created successfully.',
      memberId: data.id,
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to create team member.',
    }
  }
}

export async function updateTeamMember(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  try {
    const supabase = await createClient()

    await requireAuthenticatedUser(
      supabase,
    )

    const memberId = textValue(
      formData,
      'member_id',
    )

    const fullName = textValue(
      formData,
      'full_name',
    )

    const email = optionalValue(
      formData,
      'email',
    )

    const phone = optionalValue(
      formData,
      'phone',
    )

    const role = validateRole(
      textValue(formData, 'role'),
    )

    const workspaceId = optionalValue(
      formData,
      'workspace_id',
    )

    if (!memberId) {
      return {
        ok: false,
        message: 'Team member ID is required.',
      }
    }

    if (!fullName) {
      return {
        ok: false,
        message: 'Full name is required.',
      }
    }

    const {
      error,
    } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        email,
        phone,
        role,
        workspace_id: workspaceId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)

    if (error) {
      return {
        ok: false,
        message: `Unable to update team member: ${error.message}`,
      }
    }

    revalidatePath(
      '/dashboard/team',
    )

    return {
      ok: true,
      message:
        'Team member updated successfully.',
      memberId,
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to update team member.',
    }
  }
}

export async function toggleTeamMemberStatus(
    _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  try {
    const supabase = await createClient()

    await requireAuthenticatedUser(
      supabase,
    )

    const memberId = textValue(
      formData,
      'member_id',
    )

    const nextStatus =
      textValue(formData, 'is_active') ===
      'true'

    if (!memberId) {
      return {
        ok: false,
        message: 'Team member ID is required.',
      }
    }

    const {
      error,
    } = await supabase
      .from('users')
      .update({
        is_active: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)

    if (error) {
      return {
        ok: false,
        message: `Unable to update member status: ${error.message}`,
      }
    }

    revalidatePath(
      '/dashboard/team',
    )

    return {
      ok: true,
      message: nextStatus
        ? 'Team member activated.'
        : 'Team member deactivated.',
      memberId,
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to update team member status.',
    }
  }
}