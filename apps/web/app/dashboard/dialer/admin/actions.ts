'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '../../../../lib/supabase/server'

const allowedModes = new Set(['assisted', 'automatic'])
const allowedStatuses = new Set(['draft', 'running', 'paused', 'completed', 'archived'])
const allowedTemperatures = new Set(['any', 'hot', 'warm', 'cold'])

async function requireManager() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub as string | undefined
  if (!userId) throw new Error('Unauthorized')
  const { data: user } = await supabase.from('users').select('id, tenant_code, workspace_id').eq('id', userId).maybeSingle()
  if (!user) throw new Error('CRM user profile not found')
  const { data: tenant } = await supabase.from('tenants').select('id').eq('tenant_code', user.tenant_code).maybeSingle()
  if (!tenant) throw new Error('Tenant not found')
  const { data: roleData } = await supabase.rpc('crm_current_user_role')
  const role = String(roleData ?? '').toLowerCase()
  if (!['admin', 'manager', 'super_admin', 'owner'].includes(role)) throw new Error('Manager access required')
  return { supabase, userId, workspaceId: user.workspace_id, tenantId: tenant.id }
}

export async function createCampaign(formData: FormData) {
  const { supabase, userId, workspaceId, tenantId } = await requireManager()
  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim() || null
  const dialingMode = String(formData.get('dialing_mode') ?? 'assisted')
  const status = String(formData.get('status') ?? 'draft')
  const maxAttempts = Number(formData.get('max_attempts') ?? 3)
  const retryAfterMinutes = Number(formData.get('retry_after_minutes') ?? 60)

  if (!name) throw new Error('Campaign name is required')
  if (!allowedModes.has(dialingMode)) throw new Error('Invalid dialing mode')
  if (!allowedStatuses.has(status)) throw new Error('Invalid campaign status')
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 20) throw new Error('Max attempts must be between 1 and 20')
  if (!Number.isInteger(retryAfterMinutes) || retryAfterMinutes < 1 || retryAfterMinutes > 43200) throw new Error('Retry interval must be between 1 and 43,200 minutes')

  const { data: campaign, error } = await supabase.from('dialer_campaigns').insert({
    tenant_id: tenantId,
    workspace_id: workspaceId,
    name,
    description,
    dialing_mode: dialingMode,
    status,
    max_attempts: maxAttempts,
    retry_after_minutes: retryAfterMinutes,
    created_by: userId,
  }).select('id').single()
  if (error || !campaign) throw new Error(error?.message ?? 'Unable to create campaign')
  revalidatePath('/dashboard/dialer')
  redirect(`/dashboard/dialer/admin/${campaign.id}`)
}

export async function populateCampaign(campaignId: string, formData: FormData) {
  const { supabase, tenantId } = await requireManager()
  const temperature = String(formData.get('temperature') ?? 'any').toLowerCase()
  const limit = Number(formData.get('limit') ?? 100)
  const priority = Number(formData.get('priority') ?? 0)
  if (!allowedTemperatures.has(temperature)) throw new Error('Invalid temperature filter')
  if (!Number.isInteger(limit) || limit < 1 || limit > 5000) throw new Error('Lead limit must be between 1 and 5000')
  if (!Number.isInteger(priority) || priority < 0 || priority > 100) throw new Error('Priority must be between 0 and 100')

  const { data: campaign } = await supabase.from('dialer_campaigns').select('id, tenant_id').eq('id', campaignId).eq('tenant_id', tenantId).maybeSingle()
  if (!campaign) throw new Error('Campaign not found')

  let leadQuery = supabase
    .from('leads')
    .select('id, person_id, assigned_user_id, temperature')
    .eq('tenant_id', tenantId)
    .not('assigned_user_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (temperature !== 'any') leadQuery = leadQuery.eq('temperature', temperature)

  const { data: leads, error: leadError } = await leadQuery
  if (leadError) throw new Error(leadError.message)
  if (!leads?.length) {
    revalidatePath(`/dashboard/dialer/admin/${campaignId}`)
    return
  }

  const leadIds = leads.map((lead) => lead.id)
  const { data: phones, error: phoneError } = await supabase
    .from('person_phones')
    .select('id, person_id, is_primary, normalized_phone')
    .in('person_id', leads.map((lead) => lead.person_id))
    .neq('normalized_phone', '')
  if (phoneError) throw new Error(phoneError.message)

  const primaryByPerson = new Map<string, { id: string; normalized_phone: string }>()
  for (const phone of phones ?? []) {
    if (phone.is_primary || !primaryByPerson.has(phone.person_id)) primaryByPerson.set(phone.person_id, { id: phone.id, normalized_phone: phone.normalized_phone })
  }

  const rows = leads.flatMap((lead) => {
    const phone = primaryByPerson.get(lead.person_id)
    if (!phone) return []
    return [{
      tenant_id: tenantId,
      campaign_id: campaignId,
      lead_id: lead.id,
      person_id: lead.person_id,
      phone_id: phone.id,
      priority,
    }]
  })
  if (rows.length) {
    const { error } = await supabase.from('dialer_campaign_leads').upsert(rows, { onConflict: 'campaign_id,lead_id,phone_id', ignoreDuplicates: true })
    if (error) throw new Error(error.message)
  }

  revalidatePath(`/dashboard/dialer/admin/${campaignId}`)
  revalidatePath('/dashboard/dialer')
}
