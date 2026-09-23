import Link from 'next/link'

import {
  distributionModeLabel,
  type UserCampaignView,
} from '@/lib/crm/dialer/types'

type Props = {
  campaign: UserCampaignView
  hasActiveSession: boolean
}

export default function UserCampaignCard({
  campaign,
  hasActiveSession,
}: Props) {
  const progress =
    campaign.metrics.total > 0
      ? Math.round(
          (campaign.metrics.completed /
            campaign.metrics.total) *
            100,
        )
      : 0

  return (
    <article className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                Running
              </span>

              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {distributionModeLabel(
                  campaign.distributionMode,
                )}
              </span>
            </div>

            <h2 className="mt-3 truncate text-lg font-semibold">
              {campaign.name}
            </h2>

            {campaign.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {campaign.description}
              </p>
            ) : null}
          </div>

          <div className="shrink-0 text-left sm:text-right">
            <p className="text-xs text-muted-foreground">
              Campaign members
            </p>

            <p className="mt-1 font-semibold">
              {campaign.memberCount}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="text-muted-foreground">
              {campaign.metrics.completed.toLocaleString()}{' '}
              completed
            </span>

            <span className="font-medium">
              {progress}%
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand-gold"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SmallMetric
            label="Remaining"
            value={campaign.metrics.remaining}
          />

          <SmallMetric
            label="Calls today"
            value={campaign.activity.callsToday}
          />

          <SmallMetric
            label="Connected"
            value={campaign.activity.connectedToday}
          />

          <SmallMetric
            label="Callbacks"
            value={campaign.activity.callbacksToday}
          />
        </div>

        <div className="flex justify-end border-t pt-4">
          <Link
            href={`/dashboard/dialer/${campaign.id}`}
            className="bg-brand-gold inline-flex rounded-md px-4 py-2 text-sm font-medium text-brand-navy shadow-sm hover:bg-brand-gold-dark"
          >
            {hasActiveSession
              ? 'Continue session'
              : 'Open campaign'}
          </Link>
        </div>
      </div>
    </article>
  )
}

function SmallMetric({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value.toLocaleString()}
      </p>
    </div>
  )
}