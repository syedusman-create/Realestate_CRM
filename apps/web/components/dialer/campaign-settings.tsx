'use client'

import {
  useState,
  useTransition,
} from 'react'

import {
  archiveCampaign,
  completeCampaign,
  pauseCampaign,
  startCampaign,
} from '@/app/dashboard/dialer/admin/actions'

import {
  campaignStatusLabel,
  type DialerCampaign,
} from '@/lib/crm/dialer/types'

type Props = {
  campaign: DialerCampaign
}

export function CampaignSettings({
  campaign,
}: Props) {
  const [pending, startTransition] =
    useTransition()

  const [message, setMessage] =
    useState('')

  function run(
    action: (
      id: string,
    ) => Promise<{
      ok: boolean
      message: string
    }>,
  ) {
    startTransition(
      async () => {
        const result =
          await action(
            campaign.id,
          )

        setMessage(
          result.message,
        )
      },
    )
  }

  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Current status
          </p>

          <p className="mt-1 font-semibold">
            {campaignStatusLabel(
              campaign.status,
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {campaign.status !==
            'running' &&
            campaign.status !==
              'completed' &&
            campaign.status !==
              'archived' && (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  run(
                    startCampaign,
                  )
                }
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                Start
              </button>
            )}

          {campaign.status ===
            'running' && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(
                  pauseCampaign,
                )
              }
              className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              Pause
            </button>
          )}

          {campaign.status !==
            'completed' &&
            campaign.status !==
              'archived' && (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  run(
                    completeCampaign,
                  )
                }
                className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                Complete
              </button>
            )}

          {campaign.status !==
            'archived' && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(
                  archiveCampaign,
                )
              }
              className="rounded-md border border-destructive/40 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
            >
              Archive
            </button>
          )}
        </div>
      </div>

      {message && (
        <p className="mt-4 text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </section>
  )
}