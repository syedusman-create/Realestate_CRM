'use client'

import {
  useTransition,
} from 'react'

import {
  pauseDialerSession,
  resumeDialerSession,
  stopDialerSession,
} from '@/app/dashboard/dialer/actions'

import DeviceStatus from './device-status'
import UserCampaignMetrics from './user-campaign-metrics'

import type {
  UserCampaignWorkspaceData,
} from '@/lib/crm/dialer/types'

type Props = {
  data: UserCampaignWorkspaceData
}

export default function UserCampaignWorkspace({
  data,
}: Props) {
  const [pending, startTransition] =
    useTransition()

  const {
    campaign,
    session,
    deviceState,
  } = data

  function pause() {
    if (!session) {
      return
    }

    startTransition(
      async () => {
        await pauseDialerSession(
          session.id,
        )
      },
    )
  }

  function resume() {
    if (!session) {
      return
    }

    startTransition(
      async () => {
        await resumeDialerSession(
          session.id,
        )
      },
    )
  }

  function stop() {
    if (!session) {
      return
    }

    startTransition(
      async () => {
        await stopDialerSession(
          session.id,
        )
      },
    )
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border bg-card p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                Running campaign
              </span>

              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {campaign.dialingMode}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              {campaign.name}
            </h1>

            {campaign.description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {campaign.description}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {session ? (
              <>
                {session.status ===
                'running' ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={pause}
                    className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                  >
                    Pause session
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={resume}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                  >
                    Resume session
                  </button>
                )}

                <button
                  type="button"
                  disabled={pending}
                  onClick={stop}
                  className="rounded-md border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
                >
                  Stop session
                </button>
              </>
            ) : (
              <span className="rounded-md border px-4 py-2 text-sm text-muted-foreground">
                No active session
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <UserCampaignMetrics
          metrics={campaign.metrics}
          activity={campaign.activity}
        />

        <DeviceStatus
          state={deviceState}
        />
      </div>

      <section className="rounded-xl border bg-card p-5">
        <div>
          <h2 className="font-semibold">
            Calling workspace
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your campaign session is ready. Calling
            execution will be handled by the connected
            calling device.
          </p>
        </div>

        <div className="mt-5 rounded-xl border border-dashed p-8 text-center">
          {session?.currentQueueItemId ? (
            <>
              <p className="font-medium">
                Lead ready
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                A campaign lead is currently assigned to
                this session.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">
                Ready for the next lead
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                The mobile calling workspace will receive
                the next eligible lead.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  )
}