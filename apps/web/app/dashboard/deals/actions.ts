'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../lib/supabase/server'

export type DealActionState = { ok: boolean; message: string }
const initialState: DealActionState = { ok: true, message: '' }
const statuses = new Set(['open', 'won', 'lost', 'paused'])

function text(value: FormDataEntryValue | null) { return typeof value === 'string' ? value.trim() : '' }
function money(value: string) { if (!value) return null; const n = Number(value); return Number.isFinite(n) && n >= 0 ? n : NaN }

async function context() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub as string | undefined
  if (!userId) throw new Error('Authentication required')
  const { data: user } = await supabase.from('users').select('id, role').eq('id', userId).maybeSingle()
  if (!user) throw new Error('CRM user profile not found')
  return { supabase, userId, user }
}

export async function saveDeal(_: DealActionState = initialState, formData: FormData): Promise<DealActionState> {
  try {
    const { supabase, userId } = await context()
    const db = supabase as any
    const dealId = text(formData.get('deal_id'))
    const leadId = text(formData.get('lead_id'))
    const stageId = text(formData.get('stage_id')) || null
    const dealName = text(formData.get('deal_name'))
    const dealValue = money(text(formData.get('deal_value')))
    const expectedClose = text(formData.get('expected_close_date')) || null
    const probabilityText = text(formData.get('probability'))
    const probability = probabilityText ? Number(probabilityText) : null
    const status = text(formData.get('status')) || 'open'
    const lostReason = text(formData.get('lost_reason')) || null
    const notes = text(formData.get('notes')) || null
    if (!leadId || !dealName) return { ok: false, message: 'Lead and deal name are required.' }
    if (Number.isNaN(dealValue) || (probability != null && (!Number.isInteger(probability) || probability < 0 || probability > 100)) || !statuses.has(status)) return { ok: false, message: 'Deal values are invalid.' }

    const { data: existing, error: existingError } = dealId
      ? await db.from('deals').select('id, lead_id, owner_user_id, pipeline_id').eq('id', dealId).maybeSingle()
      : await db.from('deals').select('id, lead_id, owner_user_id, pipeline_id').eq('lead_id', leadId).maybeSingle()
    if (existingError || !existing) return { ok: false, message: 'Opportunity not found or not accessible.' }
    if (existing.lead_id !== leadId) return { ok: false, message: 'Opportunity does not belong to this lead.' }
    if (existing.owner_user_id && existing.owner_user_id !== userId) {
      const { data: manager } = await supabase.rpc('crm_can_manage_tenant')
      if (!manager) return { ok: false, message: 'You can only edit opportunities assigned to you.' }
    }
    if (stageId) {
      const { data: stage, error: stageError } = await supabase.from('pipeline_stages').select('id, pipeline_id').eq('id', stageId).maybeSingle()
      if (stageError || !stage) return { ok: false, message: 'Selected stage is invalid.' }
      if (existing.pipeline_id && stage.pipeline_id !== existing.pipeline_id) return { ok: false, message: 'Stage does not belong to this pipeline.' }
    }
    const { error } = await db.from('deals').update({ deal_name: dealName, stage_id: stageId, deal_value: dealValue, expected_close_date: expectedClose, probability, status, lost_reason: lostReason, notes, closed_at: status === 'open' || status === 'paused' ? null : new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', existing.id)
    if (error) return { ok: false, message: error.message }
    revalidatePath(`/dashboard/leads/${leadId}`); revalidatePath('/dashboard/deals'); revalidatePath('/dashboard')
    return { ok: true, message: 'Opportunity saved.' }
  } catch (error) { return { ok: false, message: error instanceof Error ? error.message : 'Unable to save opportunity.' } }
}

export async function createDeal(_: DealActionState = initialState, formData: FormData): Promise<DealActionState> {
  try {
    const { supabase, userId } = await context()
    const leadId = text(formData.get('lead_id')); const dealName = text(formData.get('deal_name'))
    if (!leadId) return { ok: false, message: 'Lead reference is missing.' }
    const { data: lead, error: leadError } = await supabase.from('leads').select('id, assigned_user_id').eq('id', leadId).maybeSingle()
    if (leadError || !lead) return { ok: false, message: 'Lead not found or not accessible.' }
    if (lead.assigned_user_id && lead.assigned_user_id !== userId) { const { data: manager } = await supabase.rpc('crm_can_manage_tenant'); if (!manager) return { ok: false, message: 'You can only create opportunities for leads assigned to you.' } }
    const { data: dealId, error } = await supabase.rpc('ensure_lead_deal', { p_lead_id: leadId, p_deal_name: dealName || null })
    if (error) return { ok: false, message: error.message }
    revalidatePath(`/dashboard/leads/${leadId}`); revalidatePath('/dashboard/deals')
    return { ok: true, message: `Opportunity ready (${dealId}).` }
  } catch (error) { return { ok: false, message: error instanceof Error ? error.message : 'Unable to create opportunity.' } }
}
