import type {
  UserCampaignActivity,
  UserCampaignMetrics,
} from '@/lib/crm/dialer/types'

type Props = {
  metrics: UserCampaignMetrics
  activity: UserCampaignActivity
}

export default function UserCampaignMetrics({
  metrics,
  activity,
}: Props) {
  const progress =
    metrics.total > 0
      ? Math.round(
          (metrics.completed /
            metrics.total) *
            100,
        )
      : 0

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Contacts"
          value={metrics.total.toLocaleString()}
        />

        <Metric
          label="Completed"
          value={metrics.completed.toLocaleString()}
        />

        <Metric
          label="Remaining"
          value={metrics.remaining.toLocaleString()}
        />

        <Metric
          label="Callbacks"
          value={metrics.callbacks.toLocaleString()}
        />
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">
              Campaign progress
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {metrics.completed.toLocaleString()} of{' '}
              {metrics.total.toLocaleString()} contacts
              completed
            </p>
          </div>

          <span className="text-sm font-semibold">
            {progress}%
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand-gold transition-all"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Calls today"
          value={activity.callsToday.toLocaleString()}
        />

        <Metric
          label="Connected"
          value={activity.connectedToday.toLocaleString()}
        />

        <Metric
          label="No answer"
          value={activity.noAnswerToday.toLocaleString()}
        />

        <Metric
          label="Callbacks today"
          value={activity.callbacksToday.toLocaleString()}
        />
      </div>
    </section>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  )
}