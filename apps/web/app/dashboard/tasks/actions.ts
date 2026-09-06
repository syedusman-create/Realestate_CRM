'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../lib/supabase/server'

const terminalStatuses = new Set(['completed', 'cancelled', 'skipped'])

export async function completeTask(taskId: string, status = 'completed') {
  if (!taskId) throw new Error('Task is required')
  if (!terminalStatuses.has(status)) throw new Error('Invalid task status')

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub as string | undefined
  if (!userId) throw new Error('Unauthorized')

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('id, lead_id, assigned_to, status')
    .eq('id', taskId)
    .maybeSingle()

  if (taskError || !task) throw new Error('Task not found')
  if (terminalStatuses.has(task.status)) return

  if (task.assigned_to && task.assigned_to !== userId) {
    const { data: role } = await supabase.rpc('crm_current_user_role')
    if (!['admin', 'manager', 'super_admin', 'owner'].includes(String(role ?? '').toLowerCase())) {
      throw new Error('You can only complete tasks assigned to you.')
    }
  }

  const { error } = await supabase
    .from('tasks')
    .update({ status, completed_at: new Date().toISOString() })
    .eq('id', taskId)
    .eq('status', task.status)

  if (error) throw new Error(error.message)

  if (task.lead_id) revalidatePath(`/dashboard/leads/${task.lead_id}`)
  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')
}
