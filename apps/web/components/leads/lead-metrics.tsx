import { Card, CardContent } from '@/components/ui/card'

type Props = {
  score: number | null
  calls: number
  lastContact: string | null
  nextFollowup: string | null
}

function formatDate(value: string | null) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

export default function LeadMetrics({
  score,
  calls,
  lastContact,
  nextFollowup,
}: Props) {
  const metrics = [
    {
      label: 'Lead score',
      value: score ?? '—',
    },
    {
      label: 'Calls',
      value: calls,
    },
    {
      label: 'Last contact',
      value: formatDate(lastContact),
    },
    {
      label: 'Next follow-up',
      value: formatDate(nextFollowup),
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardContent className="p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {metric.label}
            </div>

            <div className="mt-2 text-xl font-semibold">
              {metric.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}