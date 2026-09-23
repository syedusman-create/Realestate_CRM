import Link from 'next/link'

import { CampaignList } from '@/components/dialer/campaign-list'
import { CampaignMetrics } from '@/components/dialer/campaign-metrics'
import { createClient } from '@/lib/supabase/server'

export default async function CampaignAdminPage() {
  const supabase = await createClient()

  const {
    data: campaigns,
    error: campaignError,
  } = await supabase
    .from('dialer_campaigns')
    .select(
      `
        id,
        tenant_id,
        workspace_id,
        name,
        description,
        status,
        distribution_mode,
        round_robin_cursor,
        dialing_mode,
        max_attempts,
        retry_after_minutes,
        allow_callbacks,
        allow_voicemail,
        quiet_hours,
        compliance_config,
        created_by,
        created_at,
        updated_at
      `,
    )
    .order('created_at', {
      ascending: false,
    })

  if (campaignError) {
    throw new Error(campaignError.message)
  }

  const rows = campaigns ?? []

  const ids = rows.map((campaign) => campaign.id)

  const {
    data: queue,
    error: queueError,
  } = ids.length
    ? await supabase
        .from('dialer_campaign_leads')
        .select('campaign_id, status')
        .in('campaign_id', ids)
    : {
        data: [],
        error: null,
      }

  if (queueError) {
    throw new Error(queueError.message)
  }

  const stats = new Map<
    string,
    {
      queued: number
      completed: number
      callbacks: number
    }
  >()

  for (const row of queue ?? []) {
    const current = stats.get(row.campaign_id) ?? {
      queued: 0,
      completed: 0,
      callbacks: 0,
    }

    if (row.status === 'queued') {
      current.queued += 1
    }

    if (row.status === 'completed') {
      current.completed += 1
    }

    if (row.status === 'callback') {
      current.callbacks += 1
    }

    stats.set(row.campaign_id, current)
  }

  const campaignItems = rows.map((campaign) => {
    const current = stats.get(campaign.id)

    return {
      ...campaign,
      queue_count: current?.queued ?? 0,
      completed_count: current?.completed ?? 0,
      callback_count: current?.callbacks ?? 0,
    }
  })

  const metrics = {
    totalCampaigns: rows.length,
    running: rows.filter((row) => row.status === 'running').length,
    draft: rows.filter((row) => row.status === 'draft').length,
    paused: rows.filter((row) => row.status === 'paused').length,
    queued:
      queue?.filter((row) => row.status === 'queued').length ?? 0,
    completed:
      queue?.filter((row) => row.status === 'completed').length ?? 0,
    callbacks:
      queue?.filter((row) => row.status === 'callback').length ?? 0,
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/dialer"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Dialer
          </Link>

          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Campaign management
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Campaign control centre
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Create campaigns, build calling audiences, manage queues, and
            control campaign lifecycle.
          </p>
        </div>

        <Link
          href="/dashboard/dialer/admin/new"
          className="mt-4 inline-flex rounded-md bg-brand-gold px-4 py-2 text-sm font-medium text-brand-navy shadow-sm hover:bg-brand-gold-dark"
        >
          Create campaign
        </Link>
      </header>

      <CampaignMetrics metrics={metrics} />

      <CampaignList campaigns={campaignItems} />
    </main>
  )
}