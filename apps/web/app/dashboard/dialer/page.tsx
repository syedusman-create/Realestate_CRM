import Link from 'next/link'

import {
  claimNextDialerItem,
  pauseDialerSession,
  resumeDialerSession,
  startDialerSession,
  stopDialerSession,
} from '@/app/dashboard/dialer/actions'

import { createClient } from '@/lib/supabase/server'

export default async function DialerPage() {
  const supabase =
    await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const [
    campaignsResult,
    sessionResult,
  ] = await Promise.all([
    supabase
      .from(
        'dialer_campaigns',
      )
      .select(
        'id, name, status, dialing_mode',
      )
      .eq(
        'status',
        'running',
      )
      .order('name'),

    supabase
      .from(
        'dialer_sessions',
      )
      .select(
        `
          id,
          campaign_id,
          status,
          started_at,
          paused_at,
          current_queue_item_id
        `,
      )
      .eq(
        'agent_id',
        user.id,
      )
      .in('status', [
        'running',
        'paused',
      ])
      .order(
        'started_at',
        {
          ascending: false,
        },
      )
      .limit(1)
      .maybeSingle(),
  ])

  if (campaignsResult.error) {
    throw new Error(
      campaignsResult.error.message,
    )
  }

  if (sessionResult.error) {
    throw new Error(
      sessionResult.error.message,
    )
  }

  const campaigns =
    campaignsResult.data ??
    []

  const session =
    sessionResult.data

  const activeCampaign =
    session
      ? campaigns.find(
          (campaign) =>
            campaign.id ===
            session.campaign_id,
        ) ?? null
      : null

  async function startSession(
    campaignId: string,
  ) {
    'use server'

    await startDialerSession(
      campaignId,
    )
  }

  async function pauseSession(
    sessionId: string,
  ) {
    'use server'

    await pauseDialerSession(
      sessionId,
    )
  }

  async function resumeSession(
    sessionId: string,
  ) {
    'use server'

    await resumeDialerSession(
      sessionId,
    )
  }

  async function stopSession(
    sessionId: string,
  ) {
    'use server'

    await stopDialerSession(
      sessionId,
    )
  }

  async function claimNext(
    sessionId: string,
    campaignId: string,
  ) {
    'use server'

    await claimNextDialerItem(
      sessionId,
      campaignId,
    )
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Dialer
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Calling workspace
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Work active campaign queues from the calling device.
          </p>
        </div>
      </header>

      {session &&
      activeCampaign ? (
        <section className="rounded-xl border bg-card p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Active campaign
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                {activeCampaign.name}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {activeCampaign.dialing_mode}
                {' · '}
                Session {session.status}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {session.status ===
                'running' && (
                <form
                  action={async () => {
                    'use server'
                    await claimNext(
                      session.id,
                      activeCampaign.id,
                    )
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Claim next lead
                  </button>
                </form>
              )}

              {session.status ===
                'running' ? (
                <form
                  action={async () => {
                    'use server'
                    await pauseSession(
                      session.id,
                    )
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Pause
                  </button>
                </form>
              ) : (
                <form
                  action={async () => {
                    'use server'
                    await resumeSession(
                      session.id,
                    )
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Resume
                  </button>
                </form>
              )}

              <form
                action={async () => {
                  'use server'
                  await stopSession(
                    session.id,
                  )
                }}
              >
                <button
                  type="submit"
                  className="rounded-md border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/5"
                >
                  Stop
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric
              label="Session status"
              value={
                session.status
              }
            />

            <Metric
              label="Current queue item"
              value={
                session.current_queue_item_id
                  ? 'Claimed'
                  : 'Ready'
              }
            />

            <Metric
              label="Dialing mode"
              value={
                activeCampaign.dialing_mode
              }
            />
          </div>
        </section>
      ) : (
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">
            Start a campaign session
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Select one of the campaigns currently running.
          </p>

          {!campaigns.length ? (
            <div className="mt-5 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No campaigns are currently running.
            </div>
          ) : (
            <div className="mt-5 divide-y rounded-lg border">
              {campaigns.map(
                (campaign) => (
                  <div
                    key={
                      campaign.id
                    }
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-medium">
                        {campaign.name}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        {campaign.dialing_mode}
                      </p>
                    </div>

                    <form
                      action={async () => {
                        'use server'
                        await startSession(
                          campaign.id,
                        )
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                      >
                        Start session
                      </button>
                    </form>
                  </div>
                ),
              )}
            </div>
          )}
        </section>
      )}
    </main>
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
    <div className="rounded-lg bg-muted/50 p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-semibold capitalize">
        {value}
      </p>
    </div>
  )
}