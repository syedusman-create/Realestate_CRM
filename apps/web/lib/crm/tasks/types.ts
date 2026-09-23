import type {
  LeadPriority,
  TaskStatus,
  TaskType,
  Tables,
} from '@realestate-crm/database'

export type TaskRow = Tables<'tasks'>

export type TaskStatusValue = TaskStatus
export type TaskTypeValue = TaskType
export type TaskPriorityValue = LeadPriority

export const TASK_STATUSES = [
  'pending',
  'in_progress',
  'completed',
  'cancelled',
  'skipped',
] as const satisfies readonly TaskStatusValue[]

export const TASK_TYPES = [
  'call',
  'followup',
  'callback',
  'send_properties',
  'confirm_viewing',
  'viewing_followup',
  'send_documents',
  'negotiation',
  'custom',
] as const satisfies readonly TaskTypeValue[]

export const TASK_PRIORITIES = [
  'low',
  'normal',
  'high',
  'urgent',
] as const satisfies readonly TaskPriorityValue[]

export type TaskScope = 'all' | 'mine' | 'unassigned'

export type TaskListFilters = {
  q: string
  scope: TaskScope
  status: 'all' | TaskStatusValue
  taskType: 'all' | TaskTypeValue
  priority: 'all' | TaskPriorityValue
  assignedTo: string
}

export type TaskUser = {
  id: string
  full_name: string
  role: string
}

export type TaskPerson = {
  id: string
  full_name: string
}

export type TaskLead = {
  id: string
  person_id: string
  assigned_user_id: string | null
}

export type TaskListItem = TaskRow & {
  assignee: TaskUser | null
  person_name: string | null
}

export type TaskMetrics = {
  total: number
  pending: number
  inProgress: number
  overdue: number
  today: number
  completed: number
}

export type TaskActionState = {
  ok: boolean
  message: string
}

export const EMPTY_TASK_ACTION_STATE: TaskActionState = {
  ok: true,
  message: '',
}

export function taskTypeLabel(value: TaskTypeValue): string {
  switch (value) {
    case 'call':
      return 'Call'

    case 'followup':
      return 'Follow-up'

    case 'callback':
      return 'Callback'

    case 'send_properties':
      return 'Send Properties'

    case 'confirm_viewing':
      return 'Confirm Viewing'

    case 'viewing_followup':
      return 'Viewing Follow-up'

    case 'send_documents':
      return 'Send Documents'

    case 'negotiation':
      return 'Negotiation'

    case 'custom':
      return 'Custom'

    default:
      return value
  }
}

export function taskStatusLabel(value: TaskStatusValue): string {
  switch (value) {
    case 'pending':
      return 'Pending'

    case 'in_progress':
      return 'In Progress'

    case 'completed':
      return 'Completed'

    case 'cancelled':
      return 'Cancelled'

    case 'skipped':
      return 'Skipped'

    default:
      return value
  }
}

export function taskPriorityLabel(
  value: TaskPriorityValue,
): string {
  switch (value) {
    case 'low':
      return 'Low'

    case 'normal':
      return 'Normal'

    case 'high':
      return 'High'

    case 'urgent':
      return 'Urgent'

    default:
      return value
  }
}