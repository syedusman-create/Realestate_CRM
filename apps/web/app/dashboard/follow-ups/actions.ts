'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../lib/supabase/server'

type State = { ok: boolean; message: string }
const initial: State = { ok: true, message: '' }

async function getContext() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub as string | undefined
  if (!userId) throw new Error('Authentication required.')
  const { data: user } = await supabase.from('users').select('id, role, workspace_id').eq('id', userId).maybeSingle()
  const role = (user?.role ?? '').toLowerCase()
  if (!['admin', 'manager', 'administrator', 'sales_manager', 'team_lead', 'owner', 'super_admin'].includes(role)) throw new Error('Manager access required.')
  const { data: tenantId, error } = await supabase.rpc('crm_current_tenant_id')
  if (error || !tenantId) throw new Error(error?.message ?? 'Tenant context unavailable.')
  return { supabase, tenantId: tenantId as string, workspaceId: user?.workspace_id ?? null }
}

export async function ensureDefaultSequence(_: State = initial, formData: FormData): Promise<State> {
  try {
    const { supabase, tenantId, workspaceId } = await getContext()
    const { error } = await supabase.rpc('ensure_default_followup_sequence', { p_tenant_id: tenantId, p_workspace_id: workspaceId })
    if (error) return { ok: false, message: error.message }
    revalidatePath('/dashboard/follow-ups')
    return { ok: true, message: 'Default sequence is ready.' }
  } catch (error) { return { ok: false, message: error instanceof Error ? error.message : 'Unable to prepare sequence.' } }
}

export async function runDueAutomation(_: State = initial, formData: FormData): Promise<State> {
  try {
    const { supabase } = await getContext()
    const { data, error } = await supabase.rpc('process_due_followups', { p_limit: 200 })
    if (error) return { ok: false, message: error.message }
    revalidatePath('/dashboard/tasks')
    revalidatePath('/dashboard/follow-ups')
    revalidatePath('/dashboard')
    return { ok: true, message: `${data ?? 0} due follow-up task(s) generated.` }
  } catch (error) { return { ok: false, message: error instanceof Error ? error.message : 'Unable to run automation.' } }
}

export async function enrollLeadFollowUp(_: State = initial, formData: FormData): Promise<State> {
  try {
    const supabase = await createClient()
    const { data: claims } = await supabase.auth.getClaims()
    const userId = claims?.claims.sub as string | undefined
    if (!userId) return { ok: false, message: 'Authentication required.' }
    const leadId = String(formData.get('lead_id') ?? '').trim()
    const sequenceId = String(formData.get('sequence_id') ?? '').trim() || null
    if (!leadId) return { ok: false, message: 'Lead is required.' }
    const { error } = await supabase.rpc('enroll_lead_followup', { p_lead_id: leadId, p_sequence_id: sequenceId })
    if (error) return { ok: false, message: error.message }
    revalidatePath(`/dashboard/leads/${leadId}`)
    revalidatePath('/dashboard/tasks')
    return { ok: true, message: 'Lead enrolled in follow-up automation.' }
  } catch (error) { return { ok: false, message: error instanceof Error ? error.message : 'Unable to enroll lead.' } }
}

export async function updateLeadFollowUpStatus(_: State = initial, formData: FormData): Promise<State> {
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
    if (status !== 'active') await supabase.from('leads').update({ next_followup_at: null }).eq('id', leadId)
    revalidatePath(`/dashboard/leads/${leadId}`)
    return { ok: true, message: status === 'active' ? 'Automation resumed.' : status === 'paused' ? 'Automation paused.' : 'Automation cancelled.' }
  } catch (error) { return { ok: false, message: error instanceof Error ? error.message : 'Unable to update automation.' } }
}
