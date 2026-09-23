import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TaskMetrics } from '@/lib/crm/tasks/types'

type TaskMetricsProps = {
  metrics: TaskMetrics
}

export function TaskMetrics({ metrics }: TaskMetricsProps) {
  const cards = [
    {
      label: 'Total',
      value: metrics.total,
    },
    {
      label: 'Pending',
      value: metrics.pending,
    },
    {
      label: 'In Progress',
      value: metrics.inProgress,
    },
    {
      label: 'Due Today',
      value: metrics.today,
    },
    {
      label: 'Overdue',
      value: metrics.overdue,
    },
    {
      label: 'Completed',
      value: metrics.completed,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {card.label}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-semibold">
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}