import { TaskEditor } from '@/components/tasks/task-editor'
import { TaskFilters } from '@/components/tasks/task-filters'
import { TaskHeader } from '@/components/tasks/task-header'
import { TaskList } from '@/components/tasks/task-list'
import { TaskMetrics } from '@/components/tasks/task-metrics'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TYPES,
  type TaskListFilters,
  type TaskListItem,
} from '@/lib/crm/tasks/types'
import { createClient } from '@/lib/supabase/server'

type SearchParams = Promise<
  Record<string, string | string[] | undefined>
>

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key]

  if (Array.isArray(value)) {
    return value[0] ?? ''
  }

  return value ?? ''
}

function isTaskStatus(
  value: string,
): value is (typeof TASK_STATUSES)[number] {
  return TASK_STATUSES.some((item) => item === value)
}

function isTaskType(
  value: string,
): value is (typeof TASK_TYPES)[number] {
  return TASK_TYPES.some((item) => item === value)
}

function isTaskPriority(
  value: string,
): value is (typeof TASK_PRIORITIES)[number] {
  return TASK_PRIORITIES.some((item) => item === value)
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams

  const scopeParam = getParam(params, 'scope')
  const statusParam = getParam(params, 'status')
  const taskTypeParam = getParam(params, 'taskType')
  const priorityParam = getParam(params, 'priority')
  const assignedToParam = getParam(params, 'assignedTo')

  const filters: TaskListFilters = {
    q: getParam(params, 'q'),

    scope:
      scopeParam === 'mine' || scopeParam === 'unassigned'
        ? scopeParam
        : 'all',

    status: isTaskStatus(statusParam) ? statusParam : 'all',

    taskType: isTaskType(taskTypeParam) ? taskTypeParam : 'all',

    priority: isTaskPriority(priorityParam)
      ? priorityParam
      : 'all',

    assignedTo: assignedToParam || 'all',
  }

  const showCreate = getParam(params, 'create') === '1'

  const supabase = await createClient()

  const {
    data: {
      user: currentUser,
    },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  const [tasksResult, usersResult, leadsResult] = await Promise.all([
    supabase
      .from('tasks')
      .select(
        `
          id,
          tenant_id,
          workspace_id,
          assigned_to,
          lead_id,
          person_id,
          task_type,
          title,
          description,
          priority,
          scheduled_at,
          due_at,
          completed_at,
          status,
          source_activity_id,
          metadata,
          created_at,
          updated_at
        `,
      )
      .order('scheduled_at', { ascending: true })
      .limit(500),

    supabase
      .from('users')
      .select('id, full_name, role, is_active')
      .eq('is_active', true)
      .order('full_name', { ascending: true }),

    supabase
      .from('leads')
      .select('id, person_id')
      .order('created_at', { ascending: false })
      .limit(500),
  ])

  if (tasksResult.error) {
    throw new Error(tasksResult.error.message)
  }

  if (usersResult.error) {
    throw new Error(usersResult.error.message)
  }

  if (leadsResult.error) {
    throw new Error(leadsResult.error.message)
  }

  const tasks = tasksResult.data ?? []
  const users = usersResult.data ?? []
  const leads = leadsResult.data ?? []

  const personIds = [
    ...new Set(
      tasks
        .map((task) => task.person_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ]

  const peopleResult =
    personIds.length > 0
      ? await supabase
          .from('people')
          .select('id, first_name, last_name, display_name')
          .in('id', personIds)
      : { data: [], error: null }

  if (peopleResult.error) {
    throw new Error(peopleResult.error.message)
  }

  const peopleById = new Map(
    (peopleResult.data ?? []).map((person) => [
      person.id,
      person.display_name ||
        [person.first_name, person.last_name]
          .filter(Boolean)
          .join(' ') ||
        'Unnamed contact',
    ]),
  )

  const usersById = new Map(
    users.map((user) => [
      user.id,
      {
        id: user.id,
        full_name: user.full_name,
        role: user.role,
      },
    ]),
  )

  const leadsById = new Map(
    leads.map((lead) => [
      lead.id,
      {
        id: lead.id,
        person_id: lead.person_id,
      },
    ]),
  )

  const enrichedTasks: TaskListItem[] = tasks.map((task) => {
    const personId =
      task.person_id ??
      (task.lead_id
        ? leadsById.get(task.lead_id)?.person_id ?? null
        : null)

    return {
      ...task,

      assignee: task.assigned_to
        ? usersById.get(task.assigned_to) ?? null
        : null,

      person_name: personId
        ? peopleById.get(personId) ?? null
        : null,
    }
  })

  const normalizedQuery = filters.q.trim().toLowerCase()

  const filteredTasks = enrichedTasks.filter((task) => {
    if (
      filters.scope === 'mine' &&
      task.assigned_to !== currentUser.id
    ) {
      return false
    }

    if (
      filters.scope === 'unassigned' &&
      task.assigned_to !== null
    ) {
      return false
    }

    if (
      filters.status !== 'all' &&
      task.status !== filters.status
    ) {
      return false
    }

    if (
      filters.taskType !== 'all' &&
      task.task_type !== filters.taskType
    ) {
      return false
    }

    if (
      filters.priority !== 'all' &&
      task.priority !== filters.priority
    ) {
      return false
    }

    if (
      filters.assignedTo !== 'all' &&
      task.assigned_to !== filters.assignedTo
    ) {
      return false
    }

    if (normalizedQuery) {
      const haystack = [
        task.title,
        task.description,
        task.person_name,
        task.assignee?.full_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(normalizedQuery)) {
        return false
      }
    }

    return true
  })

  const now = new Date()

  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  const endOfToday = new Date(startOfToday)
  endOfToday.setDate(endOfToday.getDate() + 1)

  const metrics = {
    total: enrichedTasks.length,

    pending: enrichedTasks.filter(
      (task) => task.status === 'pending',
    ).length,

    inProgress: enrichedTasks.filter(
      (task) => task.status === 'in_progress',
    ).length,

    today: enrichedTasks.filter((task) => {
      const scheduledAt = new Date(task.scheduled_at)

      return (
        scheduledAt >= startOfToday &&
        scheduledAt < endOfToday &&
        task.status !== 'completed' &&
        task.status !== 'cancelled' &&
        task.status !== 'skipped'
      )
    }).length,

    overdue: enrichedTasks.filter((task) => {
      if (!task.due_at) {
        return false
      }

      if (
        task.status === 'completed' ||
        task.status === 'cancelled' ||
        task.status === 'skipped'
      ) {
        return false
      }

      return new Date(task.due_at) < now
    }).length,

    completed: enrichedTasks.filter(
      (task) => task.status === 'completed',
    ).length,
  }

  const editorUsers = users.map((user) => ({
    id: user.id,
    full_name: user.full_name,
    role: user.role,
  }))

  return (
    <div className="space-y-6">
      <TaskHeader />

      {showCreate ? (
        <TaskEditor users={editorUsers} />
      ) : null}

      <TaskMetrics metrics={metrics} />

      <TaskFilters
        filters={filters}
        users={editorUsers}
      />

      <TaskList tasks={filteredTasks} />
    </div>
  )
}