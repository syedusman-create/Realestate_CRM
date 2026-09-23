import type {
  CampaignAdminMetrics,
} from '@/lib/crm/dialer/types'

type Props = {
  metrics: CampaignAdminMetrics
}

const cards = [
  ['totalCampaigns', 'Campaigns'],
  ['running', 'Running'],
  ['draft', 'Draft'],
  ['paused', 'Paused'],
  ['queued', 'Queued leads'],
  ['completed', 'Completed'],
  ['callbacks', 'Callbacks'],
] as const

export function CampaignMetrics({
  metrics,
}: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {cards.map(
        ([key, label]) => (
          <div
            key={key}
            className="rounded-xl border bg-card p-4"
          >
            <p className="text-xs text-muted-foreground">
              {label}
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {metrics[key]}
            </p>
          </div>
        ),
      )}
    </div>
  )
}