import Link from 'next/link'

import {
  archiveCampaign,
  startCampaign,
} from '@/app/dashboard/dialer/admin/actions'

import {
  campaignStatusLabel,
  dialerModeLabel,
  type CampaignListItem,
} from '@/lib/crm/dialer/types'

type Props = {
  campaigns: CampaignListItem[]
}

export function CampaignList({
  campaigns,
}: Props) {
  if (!campaigns.length) {
    return (
      <section className="rounded-xl border border-dashed p-10 text-center">
        <h2 className="font-semibold">
          No campaigns yet
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Create the first outbound campaign to start building dialer queues.
        </p>

        <Link
          href="/dashboard/dialer/admin/new"
          className="bg-brand-gold mt-4 inline-flex rounded-md px-4 py-2 text-sm font-medium text-brand-navy shadow-sm hover:bg-brand-gold-dark"
        >
          Create campaign
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      {campaigns.map(
        (campaign) => (
          <div
            key={campaign.id}
            className="rounded-xl border bg-card p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/dialer/admin/${campaign.id}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {campaign.name}
                  </Link>

                  <span className="rounded-full border px-2.5 py-1 text-xs">
                    {campaignStatusLabel(
                      campaign.status,
                    )}
                  </span>

                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                    {dialerModeLabel(
                      campaign.dialing_mode,
                    )}
                  </span>
                </div>

                {campaign.description && (
                  <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                    {campaign.description}
                  </p>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Metric
                    label="Queued"
                    value={
                      campaign.queue_count
                    }
                  />

                  <Metric
                    label="Completed"
                    value={
                      campaign.completed_count
                    }
                  />

                  <Metric
                    label="Callbacks"
                    value={
                      campaign.callback_count
                    }
                  />
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {campaign.status !==
                  'running' &&
                  campaign.status !==
                    'completed' &&
                  campaign.status !==
                    'archived' && (
                    <form
                      action={async () => {
                        'use server'
                        await startCampaign(
                          campaign.id,
                        )
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                      >
                        Start
                      </button>
                    </form>
                  )}

                {campaign.status !==
                  'archived' && (
                  <form
                    action={async () => {
                      'use server'
                      await archiveCampaign(
                        campaign.id,
                      )
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Archive
                    </button>
                  </form>
                )}

                <Link
                  href={`/dashboard/dialer/admin/${campaign.id}`}
                  className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Manage
                </Link>
              </div>
            </div>
          </div>
        ),
      )}
    </section>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>
    </div>
  )
}