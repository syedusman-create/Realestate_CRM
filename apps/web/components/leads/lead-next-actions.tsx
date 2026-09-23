import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TaskRow } from '@/lib/crm/leads/types'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function LeadNextActions({
  tasks,
}: {
  tasks: TaskRow[]
}) {
  const pending = tasks
    .filter((task) => task.status !== 'completed')
    .sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() -
        new Date(b.scheduled_at).getTime(),
    )
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Next actions</CardTitle>
      </CardHeader>

      <CardContent>
        {!pending.length ? (
          <p className="text-sm text-muted-foreground">
            No pending actions for this lead.
          </p>
        ) : (
          <div className="space-y-3">
            {pending.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border p-3"
              >
                <div className="font-medium">
                  {task.title}
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  {formatDate(task.scheduled_at)}
                  {' · '}
                  {task.status.replace('_', ' ')}
                </div>

                {task.description && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {task.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Link
          href="/dashboard/tasks"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Open task queue →
        </Link>
      </CardContent>
    </Card>
  )
}