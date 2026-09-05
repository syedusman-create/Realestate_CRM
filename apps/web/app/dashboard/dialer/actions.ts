'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '../../../lib/supabase/server'

const DIALER_OUTCOMES = ['connected', 'not_connected', 'busy', 'no_answer', 'wrong_number', 'voicemail', 'callback_requested'] as const
export type DialerOutcome = (typeof DIALER_OUTCOMES)[number]

export async function startDialerSession(campaignId: string) {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub as string | undefined
  if (!userId) throw new Error('Unauthorized')

  const { data: user, error: userError } = await supabase.from('users').select('id, tenant_code, workspace_id').eq('id', userId).maybeSingle()
  if (userError || !user) throw new Error('CRM user profile not found')

  const { data: tenant, error: tenantError } = await supabase.from('tenants').select('id').eq('tenant_code', user.tenant_code).maybeSingle()
  if (tenantError || !tenant) throw new Error('Tenant not found')

  const { data: campaign, error: campaignError } = await supabase
    .from('dialer_campaigns')
    .select('id, status')
    .eq('id', campaignId)
    .maybeSingle()
  if (campaignError || !campaign) throw new Error('Campaign not found')
  if (campaign.status !== 'running') throw new Error('Campaign is not running')

  // One active session per agent keeps queue ownership deterministic.
  await supabase
    .from('dialer_sessions')
    .update({ status: 'stopped', stopped_at: new Date().toISOString(), current_queue_item_id: null })
    .eq('tenant_id', tenant.id)
    .eq('agent_id', userId)
    .in('status', ['running', 'paused'])

  const { data: session, error } = await supabase.from('dialer_sessions').insert({
    tenant_id: tenant.id,
    workspace_id: user.workspace_id,
    campaign_id: campaignId,
    agent_id: userId,
    status: 'running',
    device_id: 'web-assisted',
  }).select('id').single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/dialer')
  return session.id
}

export async function claimNextDialerItem(campaignId: string, sessionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('claim_next_dialer_item', {
    p_campaign_id: campaignId,
    p_session_id: sessionId,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/dialer')
  return data?.[0] ?? null
}

export async function startCampaign(campaignId: string) {
  const sessionId = await startDialerSession(campaignId)
  await claimNextDialerItem(campaignId, sessionId)
  redirect(`/dashboard/dialer?session=${sessionId}`)
}

export async function recordDialerDisposition(sessionId: string, queueItemId: string, outcome: DialerOutcome, notes: string) {
  if (!DIALER_OUTCOMES.includes(outcome)) throw new Error('Invalid disposition')

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub as string | undefined
  if (!userId) throw new Error('Unauthorized')

  const { data: session, error: sessionError } = await supabase
    .from('dialer_sessions')
    .select('id, tenant_id, workspace_id, campaign_id, agent_id')
    .eq('id', sessionId)
    .eq('agent_id', userId)
    .maybeSingle()
  if (sessionError || !session) throw new Error('Dialer session not found')

  const { data: item, error: itemError } = await supabase
    .from('dialer_campaign_leads')
    .select('id, tenant_id, campaign_id, lead_id, person_id, phone_id, status, attempt_count, last_attempt_at')
    .eq('id', queueItemId)
    .eq('campaign_id', session.campaign_id)
    .eq('claimed_by', userId)
    .maybeSingle()
  if (itemError || !item) throw new Error('Queue item is no longer owned by this session')

  const now = new Date()
  const callOutcome = outcome
  const terminal = outcome === 'connected' || outcome === 'wrong_number' || outcome === 'voicemail' || outcome === 'callback_requested'
  const queueStatus = outcome === 'callback_requested'
    ? 'callback'
    : outcome === 'wrong_number'
      ? 'wrong_number'
      : outcome === 'voicemail'
        ? 'voicemail'
        : outcome === 'connected'
          ? 'completed'
          : outcome === 'not_connected'
            ? 'no_answer'
            : outcome

  const { data: call, error: callError } = await supabase.from('calls').insert({
    tenant_id: item.tenant_id,
    workspace_id: session.workspace_id,
    lead_id: item.lead_id,
    person_id: item.person_id,
    agent_id: userId,
    direction: 'outbound',
    started_at: item.last_attempt_at ?? now.toISOString(),
    ended_at: now.toISOString(),
    duration_seconds: null,
    outcome: callOutcome,
    disposition: outcome,
    sub_disposition: null,
    notes: notes.trim() || null,
    recording_url: null,
  }).select('id').single()
  if (callError) throw new Error(callError.message)

  await supabase.from('dialer_call_events').insert({
    tenant_id: item.tenant_id,
    session_id: session.id,
    queue_item_id: item.id,
    lead_id: item.lead_id,
    person_id: item.person_id,
    call_id: call.id,
    agent_id: userId,
    direction: 'outbound',
    event_type: outcome === 'connected' ? 'connected' : outcome === 'no_answer' || outcome === 'not_connected' ? 'no_answer' : outcome === 'busy' ? 'failed' : 'ended',
    normalized_phone: null,
    source: 'web-assisted',
    external_event_id: null,
    duration_seconds: null,
    raw_payload: { disposition: outcome },
  })

  const retryable = !terminal && item.attempt_count < 20
  let nextAttemptAt: string | null = null
  if (retryable) {
    const { data: campaign } = await supabase.from('dialer_campaigns').select('retry_after_minutes, max_attempts').eq('id', session.campaign_id).maybeSingle()
    if (campaign && item.attempt_count < campaign.max_attempts) {
      nextAttemptAt = new Date(now.getTime() + campaign.retry_after_minutes * 60_000).toISOString()
    }
  }

  const finalStatus = nextAttemptAt ? queueStatus : terminal ? queueStatus : 'completed'
  await supabase.from('dialer_campaign_leads').update({
    status: finalStatus,
    next_attempt_at: nextAttemptAt,
    completed_at: nextAttemptAt ? null : now.toISOString(),
    claimed_by: null,
    claimed_at: null,
  }).eq('id', item.id).eq('claimed_by', userId)

  if (outcome === 'callback_requested') {
    await supabase.from('leads').update({ next_followup_at: new Date(now.getTime() + 60 * 60_000).toISOString(), last_contact_at: now.toISOString() }).eq('id', item.lead_id)
  } else {
    await supabase.from('leads').update({ last_contact_at: now.toISOString() }).eq('id', item.lead_id)
  }

  await supabase.from('dialer_sessions').update({ current_queue_item_id: null, last_heartbeat_at: now.toISOString() }).eq('id', session.id).eq('agent_id', userId)

  revalidatePath('/dashboard/dialer')
  revalidatePath(`/dashboard/leads/${item.lead_id}`)
}

export async function skipDialerItem(sessionId: string, queueItemId: string) {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub as string | undefined
  if (!userId) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('dialer_campaign_leads')
    .update({ status: 'skipped', completed_at: new Date().toISOString(), claimed_by: null, claimed_at: null })
    .eq('id', queueItemId)
    .eq('claimed_by', userId)
  if (error) throw new Error(error.message)

  await supabase.from('dialer_sessions').update({ current_queue_item_id: null, last_heartbeat_at: new Date().toISOString() }).eq('id', sessionId).eq('agent_id', userId)
  revalidatePath('/dashboard/dialer')
}

export async function stopDialerSession(sessionId: string) {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub as string | undefined
  if (!userId) throw new Error('Unauthorized')

  const { data: session } = await supabase.from('dialer_sessions').select('current_queue_item_id').eq('id', sessionId).eq('agent_id', userId).maybeSingle()
  if (session?.current_queue_item_id) {
    await supabase.from('dialer_campaign_leads').update({ status: 'queued', claimed_by: null, claimed_at: null }).eq('id', session.current_queue_item_id).eq('claimed_by', userId)
  }
  await supabase.from('dialer_sessions').update({ status: 'stopped', stopped_at: new Date().toISOString(), current_queue_item_id: null }).eq('id', sessionId).eq('agent_id', userId)
  revalidatePath('/dashboard/dialer')
  redirect('/dashboard/dialer')
}
