'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

const DIALER_PATH =
  '/dashboard/dialer'

export type DialerActionState = {
  ok: boolean
  message: string
}

async function getContext() {
  const supabase =
    await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error(
      'Unauthorized',
    )
  }

  const {
    data: profile,
    error,
  } = await supabase
    .from('users')
    .select(
      'id, tenant_code, workspace_id, full_name, role, is_active',
    )
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(
      error.message,
    )
  }

  if (
    !profile ||
    !profile.is_active
  ) {
    throw new Error(
      'Active user profile not found',
    )
  }

  const {
    data: tenant,
    error: tenantError,
  } = await supabase
    .from('tenants')
    .select('id')
    .eq(
      'tenant_code',
      profile.tenant_code,
    )
    .maybeSingle()

  if (tenantError) {
    throw new Error(
      tenantError.message,
    )
  }

  if (!tenant) {
    throw new Error(
      'Tenant not found',
    )
  }

  return {
    supabase,
    user,
    profile,
    tenant,
  }
}

export async function startDialerSession(
  campaignId: string,
) {
  const {
    supabase,
    user,
    profile,
    tenant,
  } = await getContext()

  if (!campaignId) {
    throw new Error(
      'Campaign is required',
    )
  }

  const {
    data: campaign,
    error,
  } = await supabase
    .from('dialer_campaigns')
    .select(
      'id, tenant_id, workspace_id, status',
    )
    .eq(
      'id',
      campaignId,
    )
    .maybeSingle()

  if (error) {
    throw new Error(
      error.message,
    )
  }

  if (
    !campaign ||
    campaign.tenant_id !==
      tenant.id
  ) {
    throw new Error(
      'Campaign not found',
    )
  }

  if (
    campaign.status !==
    'running'
  ) {
    throw new Error(
      'The campaign must be running before an agent can start a session.',
    )
  }

  /*
   * Campaign membership is deliberately checked server-side.
   *
   * UI visibility is not an authorization boundary.
   */
  const {
    data: membership,
    error:
      membershipError,
  } = await supabase
    .from(
      'dialer_campaign_members',
    )
    .select('id')
    .eq(
      'campaign_id',
      campaignId,
    )
    .eq(
      'user_id',
      user.id,
    )
    .eq(
      'is_active',
      true,
    )
    .maybeSingle()

  if (membershipError) {
    throw new Error(
      membershipError.message,
    )
  }

  if (!membership) {
    throw new Error(
      'You are not assigned to this campaign.',
    )
  }

  /*
   * A user should have at most one active campaign
   * session at a time.
   */
  const {
    data: existing,
    error:
      existingError,
  } = await supabase
    .from(
      'dialer_sessions',
    )
    .select(
      'id, campaign_id, status',
    )
    .eq(
      'agent_id',
      user.id,
    )
    .in('status', [
      'running',
      'paused',
    ])
    .order(
      'started_at',
      {
        ascending: false,
      },
    )
    .limit(1)
    .maybeSingle()

  if (existingError) {
    throw new Error(
      existingError.message,
    )
  }

  if (existing) {
    if (
      existing.campaign_id ===
      campaignId
    ) {
      return existing.id
    }

    throw new Error(
      'You already have an active dialer session for another campaign. Stop that session before starting another one.',
    )
  }

  const now =
    new Date().toISOString()

  const {
    data: session,
    error: sessionError,
  } = await supabase
    .from(
      'dialer_sessions',
    )
    .insert({
      tenant_id:
        tenant.id,
      workspace_id:
        profile.workspace_id ??
        campaign.workspace_id ??
        null,
      campaign_id:
        campaignId,
      agent_id:
        user.id,
      status:
        'running',
      started_at:
        now,
      last_heartbeat_at:
        now,
      stats: {},
    })
    .select('id')
    .single()

  if (sessionError) {
    throw new Error(
      sessionError.message,
    )
  }

  revalidatePath(
    DIALER_PATH,
  )

  revalidatePath(
    `/dashboard/dialer/${campaignId}`,
  )

  return session.id
}

export async function pauseDialerSession(
  sessionId: string,
) {
  const {
    supabase,
    user,
  } = await getContext()

  const now =
    new Date().toISOString()

  const {
    error,
  } = await supabase
    .from(
      'dialer_sessions',
    )
    .update({
      status: 'paused',
      paused_at: now,
      last_heartbeat_at:
        now,
      updated_at: now,
    })
    .eq(
      'id',
      sessionId,
    )
    .eq(
      'agent_id',
      user.id,
    )
    .in('status', [
      'running',
    ])

  if (error) {
    throw new Error(
      error.message,
    )
  }

  revalidatePath(
    DIALER_PATH,
  )

  revalidateSessionPaths(
    sessionId,
  )
}

export async function resumeDialerSession(
  sessionId: string,
) {
  const {
    supabase,
    user,
  } = await getContext()

  const now =
    new Date().toISOString()

  const {
    data: session,
    error,
  } = await supabase
    .from(
      'dialer_sessions',
    )
    .update({
      status: 'running',
      paused_at: null,
      last_heartbeat_at:
        now,
      updated_at: now,
    })
    .eq(
      'id',
      sessionId,
    )
    .eq(
      'agent_id',
      user.id,
    )
    .eq(
      'status',
      'paused',
    )
    .select(
      'campaign_id',
    )
    .maybeSingle()

  if (error) {
    throw new Error(
      error.message,
    )
  }

  if (session) {
    revalidatePath(
      `/dashboard/dialer/${session.campaign_id}`,
    )
  }

  revalidatePath(
    DIALER_PATH,
  )
}

export async function stopDialerSession(
  sessionId: string,
) {
  const {
    supabase,
    user,
  } = await getContext()

  const now =
    new Date().toISOString()

  const {
    data: session,
    error,
  } = await supabase
    .from(
      'dialer_sessions',
    )
    .update({
      status: 'stopped',
      stopped_at: now,
      current_queue_item_id:
        null,
      last_heartbeat_at:
        now,
      updated_at: now,
    })
    .eq(
      'id',
      sessionId,
    )
    .eq(
      'agent_id',
      user.id,
    )
    .in('status', [
      'running',
      'paused',
    ])
    .select(
      'campaign_id',
    )
    .maybeSingle()

  if (error) {
    throw new Error(
      error.message,
    )
  }

  if (session) {
    revalidatePath(
      `/dashboard/dialer/${session.campaign_id}`,
    )
  }

  revalidatePath(
    DIALER_PATH,
  )
}

export async function heartbeatDialerSession(
  sessionId: string,
) {
  const {
    supabase,
    user,
  } = await getContext()

  const now =
    new Date().toISOString()

  const {
    error,
  } = await supabase
    .from(
      'dialer_sessions',
    )
    .update({
      last_heartbeat_at:
        now,
      updated_at: now,
    })
    .eq(
      'id',
      sessionId,
    )
    .eq(
      'agent_id',
      user.id,
    )
    .eq(
      'status',
      'running',
    )

  if (error) {
    throw new Error(
      error.message,
    )
  }
}

function revalidateSessionPaths(
  sessionId: string,
) {
  /*
   * Session-to-campaign lookup is intentionally
   * performed by the page on the next request.
   *
   * The main dialer path is enough for this stage.
   */
  revalidatePath(
    DIALER_PATH,
  )
}