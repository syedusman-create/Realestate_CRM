import Link from 'next/link'

import {
  completeTask,
  startTask,
} from '@/app/dashboard/tasks/actions'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  taskPriorityLabel,
  taskStatusLabel,
  taskTypeLabel,
  type TaskListItem,
} from '@/lib/crm/tasks/types'

type TaskListProps = {
  tasks: TaskListItem[]
}

function formatDate(value: string | null) {
  if (!value) {
    return 'No due date'
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function isOverdue(task: TaskListItem) {
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

  return new Date(task.due_at).getTime() < Date.now()
}

function priorityVariant(
  priority: TaskListItem['priority'],
) {
  switch (priority) {
    case 'urgent':
      return 'destructive' as const

    case 'high':
      return 'secondary' as const

    default:
      return 'outline' as const
  }
}

export function TaskList({
  tasks,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <h3 className="font-medium">
          No tasks found
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Create a task or adjust your filters.
        </p>

        <Link
          href="/dashboard/tasks?create=1"
          className={buttonVariants({
            className: 'mt-4',
          })}
        >
          Create task
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const overdue = isOverdue(task)

        return (
          <div
            key={task.id}
            className={[
              'rounded-xl border bg-card p-4 transition-colors',
              overdue
                ? 'border-destructive/50'
                : '',
            ].join(' ')}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">
                    {task.title}
                  </h3>

                  <Badge
                    variant={priorityVariant(
                      task.priority,
                    )}
                  >
                    {taskPriorityLabel(
                      task.priority,
                    )}
                  </Badge>

                  <Badge variant="outline">
                    {taskTypeLabel(
                      task.task_type,
                    )}
                  </Badge>

                  {overdue && (
                    <Badge variant="destructive">
                      Overdue
                    </Badge>
                  )}
                </div>

                {task.description && (
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Status:{' '}
                    {taskStatusLabel(
                      task.status,
                    )}
                  </span>

                  <span>
                    Scheduled:{' '}
                    {formatDate(
                      task.scheduled_at,
                    )}
                  </span>

                  {task.due_at && (
                    <span>
                      Due:{' '}
                      {formatDate(task.due_at)}
                    </span>
                  )}

                  {task.assignee && (
                    <span>
                      Assigned to:{' '}
                      {task.assignee.full_name}
                    </span>
                  )}

                  {task.person_name && (
                    <span>
                      Contact:{' '}
                      {task.person_name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {task.status === 'pending' && (
                  <form
                    action={async () => {
                      'use server'
                      await startTask(task.id)
                    }}
                  >
                    <Button
                      type="submit"
                      size="sm"
                      variant="outline"
                    >
                      Start
                    </Button>
                  </form>
                )}

                {(task.status === 'pending' ||
                  task.status ===
                    'in_progress') && (
                  <form
                    action={async () => {
                      'use server'
                      await completeTask(task.id)
                    }}
                  >
                    <Button
                      type="submit"
                      size="sm"
                    >
                      Complete
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}