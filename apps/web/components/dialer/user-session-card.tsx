import Link from 'next/link'

import type {
  UserCampaignView,
  UserDialerSessionView,
} from '@/lib/crm/dialer/types'

type Props = {
  campaign: UserCampaignView
  session: UserDialerSessionView
}

export default function UserSessionCard({
  campaign,
  session,
}: Props) {
  const isPaused =
    session.status === 'paused'

  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                'rounded-full px-2.5 py-1 text-xs font-medium',
                isPaused
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-emerald-50 text-emerald-700',
              ].join(' ')}
            >
              {isPaused
                ? 'Session paused'
                : 'Session active'}
            </span>

            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {campaign.dialingMode}
            </span>
          </div>

          <h2 className="mt-3 text-xl font-semibold">
            {campaign.name}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Started{' '}
            {formatDate(
              session.startedAt,
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/dialer/${campaign.id}`}
            className="bg-brand-gold inline-flex rounded-md px-4 py-2 text-sm font-medium text-brand-navy shadow-sm hover:bg-brand-gold-dark"
          >
            Open workspace
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <SessionMetric
          label="Session"
          value={
            isPaused
              ? 'Paused'
              : 'Running'
          }
        />

        <SessionMetric
          label="Current queue"
          value={
            session.currentQueueItemId
              ? 'Assigned'
              : 'Ready'
          }
        />

        <SessionMetric
          label="Device"
          value={
            session.deviceId
              ? 'Registered'
              : 'Waiting'
          }
        />
      </div>
    </section>
  )
}

function SessionMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value}
      </p>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    'en-IN',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  ).format(new Date(value))
}