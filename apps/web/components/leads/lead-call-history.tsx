import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CallRow } from '@/lib/crm/leads/types'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function LeadCallHistory({
  calls,
}: {
  calls: CallRow[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Call history</CardTitle>
      </CardHeader>

      <CardContent>
        {!calls.length ? (
          <p className="text-sm text-muted-foreground">
            No calls recorded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {calls.map((call) => (
              <div
                key={call.id}
                className="flex flex-col gap-2 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-medium capitalize">
                    {call.direction} call
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatDate(call.started_at)}
                  </div>
                </div>

                <div className="text-sm capitalize text-muted-foreground">
                  {call.outcome.replaceAll('_', ' ')}
                </div>

                {call.duration_seconds != null && (
                  <div className="text-sm text-muted-foreground">
                    {Math.floor(call.duration_seconds / 60)}m{' '}
                    {call.duration_seconds % 60}s
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}