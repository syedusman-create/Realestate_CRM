'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../../lib/supabase/server'

export type FollowUpAutomationState = { ok: boolean; message: string }
const initial: FollowUpAutomationState = { ok: true, message: '' }

export async function enrollLeadFollowUp(_: FollowUpAutomationState = initial, formData: FormData): Promise<FollowUpAutomationState> {
  try {
    const supabase = await createClient()
    const { data: claims } = await supabase.auth.getClaims()
    if (!claims?.claims.sub) return { ok: false, message: 'Authentication required.' }
    const leadId = String(formData.get('lead_id') ?? '').trim()
    if (!leadId) return { ok: false, message: 'Lead is required.' }
    const { error } = await supabase.rpc('enroll_lead_followup', { p_lead_id: leadId, p_sequence_id: null })
    if (error) return { ok: false, message: error.message }
    revalidatePath(`/dashboard/leads/${leadId}`)
    revalidatePath('/dashboard/tasks')
    return { ok: true, message: 'Lead enrolled in follow-up automation.' }
  } catch (error) { return { ok: false, message: error instanceof Error ? error.message : 'Unable to enroll lead.' } }
}

export async function updateLeadFollowUpStatus(_: FollowUpAutomationState = initial, formData: FormData): Promise<FollowUpAutomationState> {
  try {
    const supabase = await createClient()
    const { data: claims } = await supabase.auth.getClaims()
    if (!claims?.claims.sub) return { ok: false, message: 'Authentication required.' }
    const leadId = String(formData.get('lead_id') ?? '').trim()
    const enrollmentId = String(formData.get('enrollment_id') ?? '').trim()
    const status = String(formData.get('status') ?? '').trim()
    if (!leadId || !enrollmentId || !['active', 'paused', 'cancelled'].includes(status)) return { ok: false, message: 'Invalid follow-up state.' }
    const update = status === 'active' ? { status, next_run_at: new Date().toISOString(), completed_at: null } : { status, next_run_at: null }
    const { error } = await (supabase as any).from('lead_followup_enrollments').update(update).eq('id', enrollmentId).eq('lead_id', leadId)
    if (error) return { ok: false, message: error.message }
    await supabase.from('leads').update({ next_followup_at: status === 'active' ? new Date().toISOString() : null }).eq('id', leadId)
    revalidatePath(`/dashboard/leads/${leadId}`)
    return { ok: true, message: status === 'active' ? 'Automation resumed.' : status === 'paused' ? 'Automation paused.' : 'Automation cancelled.' }
  } catch (error) { return { ok: false, message: error instanceof Error ? error.message : 'Unable to update automation.' } }
}
