'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

const DIALER_PATH = '/dashboard/dialer'

export type DialerActionState = {
  ok: boolean
  message: string
}

const EMPTY_DIALER_ACTION_STATE: DialerActionState = {
  ok: true,
  message: '',
}

async function getContext() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: profile, error } =
    await supabase
      .from('users')
      .select(
        'id, tenant_code, workspace_id, full_name, role, is_active',
      )
      .eq('id', user.id)
      .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!profile || !profile.is_active) {
    throw new Error('Active user profile not found')
  }

  const { data: tenant, error: tenantError } =
    await supabase
      .from('tenants')
      .select('id')
      .eq('tenant_code', profile.tenant_code)
      .maybeSingle()

  if (tenantError) {
    throw new Error(tenantError.message)
  }

  if (!tenant) {
    throw new Error('Tenant not found')
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
    throw new Error('Campaign is required')
  }

  const { data: campaign, error } =
    await supabase
      .from('dialer_campaigns')
      .select(
        'id, tenant_id, workspace_id, status',
      )
      .eq('id', campaignId)
      .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (
    !campaign ||
    campaign.tenant_id !== tenant.id
  ) {
    throw new Error('Campaign not found')
  }

  if (
    campaign.status !== 'running'
  ) {
    throw new Error(
      'The campaign must be running before an agent can start a session.',
    )
  }

  const { data: existing } =
    await supabase
      .from('dialer_sessions')
      .select('id, status')
      .eq('campaign_id', campaignId)
      .eq('agent_id', user.id)
      .in('status', [
        'running',
        'paused',
      ])
      .maybeSingle()

  if (existing) {
    return existing.id
  }

  const { data: session, error: sessionError } =
    await supabase
      .from('dialer_sessions')
      .insert({
        tenant_id: tenant.id,
        workspace_id:
          profile.workspace_id ?? null,
        campaign_id: campaignId,
        agent_id: user.id,
        status: 'running',
        started_at: new Date().toISOString(),
        last_heartbeat_at:
          new Date().toISOString(),
        stats: {},
      })
      .select('id')
      .single()

  if (sessionError) {
    throw new Error(
      sessionError.message,
    )
  }

  revalidatePath(DIALER_PATH)

  return session.id
}

export async function pauseDialerSession(
  sessionId: string,
) {
  const { supabase, user } =
    await getContext()

  const { error } = await supabase
    .from('dialer_sessions')
    .update({
      status: 'paused',
      paused_at:
        new Date().toISOString(),
      last_heartbeat_at:
        new Date().toISOString(),
      updated_at:
        new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('agent_id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(DIALER_PATH)
}

export async function resumeDialerSession(
  sessionId: string,
) {
  const { supabase, user } =
    await getContext()

  const { error } = await supabase
    .from('dialer_sessions')
    .update({
      status: 'running',
      paused_at: null,
      last_heartbeat_at:
        new Date().toISOString(),
      updated_at:
        new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('agent_id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(DIALER_PATH)
}

export async function stopDialerSession(
  sessionId: string,
) {
  const { supabase, user } =
    await getContext()

  const { error } = await supabase
    .from('dialer_sessions')
    .update({
      status: 'stopped',
      stopped_at:
        new Date().toISOString(),
      current_queue_item_id: null,
      last_heartbeat_at:
        new Date().toISOString(),
      updated_at:
        new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('agent_id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(DIALER_PATH)
}

export async function heartbeatDialerSession(
  sessionId: string,
) {
  const { supabase, user } =
    await getContext()

  const { error } = await supabase
    .from('dialer_sessions')
    .update({
      last_heartbeat_at:
        new Date().toISOString(),
      updated_at:
        new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('agent_id', user.id)
    .eq('status', 'running')

  if (error) {
    throw new Error(error.message)
  }
}

export async function claimNextDialerItem(
  sessionId: string,
  campaignId: string,
) {
  const { supabase, user } =
    await getContext()

  const { data: session } =
    await supabase
      .from('dialer_sessions')
      .select(
        'id, campaign_id, status, agent_id',
      )
      .eq('id', sessionId)
      .eq('agent_id', user.id)
      .maybeSingle()

  if (!session) {
    throw new Error('Dialer session not found')
  }

  if (
    session.campaign_id !==
    campaignId
  ) {
    throw new Error(
      'Session does not belong to this campaign',
    )
  }

  if (session.status !== 'running') {
    throw new Error(
      'Dialer session is not running',
    )
  }

  const { data, error } =
    await supabase.rpc(
      'claim_next_dialer_item',
      {
        p_campaign_id: campaignId,
        p_session_id: sessionId,
      },
    )

  if (error) {
    throw new Error(error.message)
  }

  const item =
    data?.[0] ?? null

  if (item) {
    await supabase
      .from('dialer_sessions')
      .update({
        current_queue_item_id:
          item.id,
        last_heartbeat_at:
          new Date().toISOString(),
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('agent_id', user.id)
  }

  revalidatePath(DIALER_PATH)

  return item
}

export async function clearCurrentQueueItem(
  sessionId: string,
) {
  const { supabase, user } =
    await getContext()

  const { error } = await supabase
    .from('dialer_sessions')
    .update({
      current_queue_item_id: null,
      last_heartbeat_at:
        new Date().toISOString(),
      updated_at:
        new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('agent_id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(DIALER_PATH)
}

export async function recordCall(
  formData: FormData,
): Promise<DialerActionState> {
  try {
    const {
      supabase,
      user,
      tenant,
      profile,
    } = await getContext()

    const leadId = String(
      formData.get('lead_id') ?? '',
    )

    const personId = String(
      formData.get('person_id') ?? '',
    )

    const sessionId = String(
      formData.get('session_id') ?? '',
    )

    const queueItemId = String(
      formData.get('queue_item_id') ?? '',
    )

    const outcome = String(
      formData.get('outcome') ?? '',
    )

    const notes =
      String(
        formData.get('notes') ?? '',
      ).trim() || null

    if (
      !leadId ||
      !personId ||
      !outcome
    ) {
      return {
        ok: false,
        message:
          'Lead, person, and call outcome are required.',
      }
    }

    const startedAt =
      String(
        formData.get(
          'started_at',
        ) ?? '',
      ) || new Date().toISOString()

    const endedAt =
      new Date().toISOString()

    const durationValue = Number(
      formData.get(
        'duration_seconds',
      ),
    )

    const durationSeconds =
      Number.isFinite(
        durationValue,
      )
        ? Math.max(
            0,
            Math.trunc(
              durationValue,
            ),
          )
        : null

    const { data: call, error } =
      await supabase
        .from('calls')
        .insert({
          tenant_id: tenant.id,
          workspace_id:
            profile.workspace_id ??
            null,
          lead_id: leadId,
          person_id: personId,
          agent_id: user.id,
          direction: 'outbound',
          started_at: startedAt,
          ended_at: endedAt,
          duration_seconds:
            durationSeconds,
          outcome: outcome as never,
          disposition:
            String(
              formData.get(
                'disposition',
              ) ?? '',
            ).trim() || null,
          sub_disposition:
            String(
              formData.get(
                'sub_disposition',
              ) ?? '',
            ).trim() || null,
          notes,
          recording_url: null,
        })
        .select('id')
        .single()

    if (error) {
      throw new Error(error.message)
    }

    if (queueItemId) {
      const queueStatus =
        outcome === 'callback_requested'
          ? 'callback'
          : outcome ===
              'connected'
            ? 'completed'
            : outcome ===
                'busy'
              ? 'busy'
              : outcome ===
                  'wrong_number'
                ? 'wrong_number'
                : outcome ===
                    'voicemail'
                  ? 'voicemail'
                  : 'no_answer'

      await supabase
        .from('dialer_campaign_leads')
        .update({
          status:
            queueStatus,
          last_attempt_at:
            endedAt,
          claimed_by: null,
          claimed_at: null,
          completed_at:
            queueStatus ===
            'completed'
              ? endedAt
              : null,
          next_attempt_at:
            queueStatus ===
            'completed'
              ? null
              : new Date(
                  Date.now() +
                    60 * 60 * 1000,
                ).toISOString(),
          updated_at:
            endedAt,
        })
        .eq('id', queueItemId)
        .eq('claimed_by', user.id)

      if (sessionId) {
        await supabase
          .from('dialer_sessions')
          .update({
            current_queue_item_id:
              null,
            last_heartbeat_at:
              endedAt,
            updated_at:
              endedAt,
          })
          .eq('id', sessionId)
          .eq('agent_id', user.id)
      }

      await supabase
        .from('dialer_call_events')
        .insert({
          tenant_id: tenant.id,
          session_id:
            sessionId || null,
          queue_item_id:
            queueItemId,
          lead_id: leadId,
          person_id: personId,
          call_id: call.id,
          agent_id: user.id,
          direction: 'outbound',
          event_type:
            'dispositioned',
          event_at: endedAt,
          normalized_phone: null,
          source: 'crm',
          external_event_id: null,
          duration_seconds:
            durationSeconds,
          raw_payload: {
            outcome,
            disposition:
              String(
                formData.get(
                  'disposition',
                ) ?? '',
              ),
          },
        })
    }

    revalidatePath(DIALER_PATH)

    return {
      ok: true,
      message: 'Call recorded.',
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to record call.',
    }
  }
}