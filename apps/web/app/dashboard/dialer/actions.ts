'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../lib/supabase/server'

export async function startDialerSession(campaignId: string) {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub as string | undefined
  if (!userId) throw new Error('Unauthorized')

  const { data: user, error: userError } = await supabase.from('users').select('id, tenant_code, workspace_id').eq('id', userId).maybeSingle()
  if (userError || !user) throw new Error('CRM user profile not found')

  const { data: tenant, error: tenantError } = await supabase.from('tenants').select('id').eq('tenant_code', user.tenant_code).maybeSingle()
  if (tenantError || !tenant) throw new Error('Tenant not found')

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
