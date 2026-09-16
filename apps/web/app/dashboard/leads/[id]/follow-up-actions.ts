'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../../lib/supabase/server'

export type FollowUpActionState = { ok: boolean; message: string }
const initialState: FollowUpActionState = { ok: true, message: '' }
const taskTypes = new Set(['call', 'followup', 'callback', 'send_properties', 'confirm_viewing'])
const priorities = new Set(['low', 'normal', 'high', 'urgent'])

function text(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function createLeadFollowUp(_: FollowUpActionState = initialState, formData: FormData): Promise<FollowUpActionState> {
  try {
    const supabase = await createClient()
    const { data: claims } = await supabase.auth.getClaims()
    const userId = claims?.claims.sub as string | undefined
    if (!userId) return { ok: false, message: 'Authentication required.' }

    const leadId = text(formData.get('lead_id'))
    const title = text(formData.get('title'))
    const description = text(formData.get('description'))
    const taskType = text(formData.get('task_type'))
    const priority = text(formData.get('priority'))
    const scheduledAt = text(formData.get('scheduled_at'))
    const dueAt = text(formData.get('due_at'))

    if (!leadId || !title || !scheduledAt) return { ok: false, message: 'Lead, title and scheduled time are required.' }
    if (!taskTypes.has(taskType) || !priorities.has(priority)) return { ok: false, message: 'Invalid follow-up type or priority.' }

    const scheduledDate = new Date(scheduledAt)
    if (Number.isNaN(scheduledDate.getTime())) return { ok: false, message: 'Scheduled time is invalid.' }
    const dueDate = dueAt ? new Date(dueAt) : scheduledDate
    if (Number.isNaN(dueDate.getTime())) return { ok: false, message: 'Due time is invalid.' }
    if (dueDate.getTime() < scheduledDate.getTime()) return { ok: false, message: 'Due time cannot be before the scheduled time.' }

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, tenant_id, workspace_id, person_id, assigned_user_id')
      .eq('id', leadId)
      .maybeSingle()
    if (leadError || !lead) return { ok: false, message: 'Lead not found or not accessible.' }

    if (lead.assigned_user_id && lead.assigned_user_id !== userId) {
      const { data: canManage } = await supabase.rpc('crm_can_manage_tenant')
      if (!canManage) return { ok: false, message: 'You can only schedule follow-ups for leads assigned to you.' }
    }

    const assignedTo = lead.assigned_user_id ?? userId
    const { error: taskError } = await supabase.from('tasks').insert({
      tenant_id: lead.tenant_id,
      workspace_id: lead.workspace_id,
      assigned_to: assignedTo,
      lead_id: lead.id,
      person_id: lead.person_id,
      task_type: taskType,
      title,
      description: description || null,
      priority,
      scheduled_at: scheduledDate.toISOString(),
      due_at: dueDate.toISOString(),
      status: 'pending',
    })
    if (taskError) return { ok: false, message: taskError.message }

    const { error: leadUpdateError } = await supabase
      .from('leads')
      .update({ next_followup_at: scheduledDate.toISOString() })
      .eq('id', lead.id)
    if (leadUpdateError) return { ok: false, message: `Follow-up created, but lead reminder was not updated: ${leadUpdateError.message}` }

    revalidatePath(`/dashboard/leads/${leadId}`)
    revalidatePath('/dashboard/tasks')
    revalidatePath('/dashboard')
    return { ok: true, message: 'Follow-up scheduled.' }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Unable to schedule follow-up.' }
  }
}
