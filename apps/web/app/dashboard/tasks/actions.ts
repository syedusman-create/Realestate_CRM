'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import type {
  TaskPriorityValue,
  TaskStatusValue,
  TaskTypeValue,
} from '@/lib/crm/tasks/types'

type ActionResult = {
  ok: boolean
  message: string
}

const SUCCESS: ActionResult = {
  ok: true,
  message: '',
}

async function getCurrentProfile() {
  const supabase = await createClient()

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be signed in.')
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('id, tenant_code, workspace_id, role, is_active')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!profile || !profile.is_active) {
    throw new Error('Active CRM profile not found.')
  }

  return {
    supabase,
    user,
    profile,
  }
}

function parseOptionalUuid(value: FormDataEntryValue | null): string | null {
  const raw = typeof value === 'string' ? value.trim() : ''

  if (!raw) {
    return null
  }

  return raw
}

function parseOptionalText(value: FormDataEntryValue | null): string | null {
  const raw = typeof value === 'string' ? value.trim() : ''

  return raw || null
}

function parseDateTime(
  value: FormDataEntryValue | null,
  required: boolean,
): string | null {
  const raw = typeof value === 'string' ? value.trim() : ''

  if (!raw) {
    if (required) {
      throw new Error('Scheduled date and time are required.')
    }

    return null
  }

  const parsed = new Date(raw)

  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid date and time.')
  }

  return parsed.toISOString()
}

function assertTaskType(value: string): asserts value is TaskTypeValue {
  const allowed = [
    'call',
    'followup',
    'callback',
    'send_properties',
    'confirm_viewing',
    'viewing_followup',
    'send_documents',
    'negotiation',
    'custom',
  ]

  if (!allowed.includes(value)) {
    throw new Error('Invalid task type.')
  }
}

function assertPriority(value: string): asserts value is TaskPriorityValue {
  const allowed = ['low', 'normal', 'high', 'urgent']

  if (!allowed.includes(value)) {
    throw new Error('Invalid task priority.')
  }
}

function assertStatus(value: string): asserts value is TaskStatusValue {
  const allowed = [
    'pending',
    'in_progress',
    'completed',
    'cancelled',
    'skipped',
  ]

  if (!allowed.includes(value)) {
    throw new Error('Invalid task status.')
  }
}

export async function createTask(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { supabase, profile } = await getCurrentProfile()

    const title = parseOptionalText(formData.get('title'))
    const description = parseOptionalText(formData.get('description'))
    const assignedTo = parseOptionalUuid(formData.get('assigned_to'))
    const leadId = parseOptionalUuid(formData.get('lead_id'))
    const personId = parseOptionalUuid(formData.get('person_id'))

    const taskType = String(formData.get('task_type') ?? '')
    const priority = String(formData.get('priority') ?? 'normal')

    assertTaskType(taskType)
    assertPriority(priority)

    if (!title) {
      throw new Error('Task title is required.')
    }

    if (title.length > 200) {
      throw new Error('Task title is too long.')
    }

    const scheduledAt = parseDateTime(formData.get('scheduled_at'), true)
    const dueAt = parseDateTime(formData.get('due_at'), false)

    const { error } = await supabase.from('tasks').insert({
      tenant_id: (
        await supabase
          .from('tenants')
          .select('id')
          .eq('tenant_code', profile.tenant_code)
          .single()
      ).data?.id,
      workspace_id: profile.workspace_id,
      assigned_to: assignedTo,
      lead_id: leadId,
      person_id: personId,
      task_type: taskType,
      title,
      description,
      priority,
      scheduled_at: scheduledAt,
      due_at: dueAt,
      status: 'pending',
      metadata: {},
    })

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/dashboard/tasks')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/leads')

    return SUCCESS
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : 'Unable to create task.',
    }
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatusValue,
): Promise<ActionResult> {
  try {
    const { supabase } = await getCurrentProfile()

    assertStatus(status)

    const completedAt =
      status === 'completed' ? new Date().toISOString() : null

    const { error } = await supabase
      .from('tasks')
      .update({
        status,
        completed_at: completedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/dashboard/tasks')
    revalidatePath('/dashboard')

    return SUCCESS
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to update task status.',
    }
  }
}

export async function completeTask(taskId: string): Promise<ActionResult> {
  return updateTaskStatus(taskId, 'completed')
}

export async function startTask(taskId: string): Promise<ActionResult> {
  return updateTaskStatus(taskId, 'in_progress')
}

export async function cancelTask(taskId: string): Promise<ActionResult> {
  return updateTaskStatus(taskId, 'cancelled')
}

export async function reopenTask(taskId: string): Promise<ActionResult> {
  return updateTaskStatus(taskId, 'pending')
}