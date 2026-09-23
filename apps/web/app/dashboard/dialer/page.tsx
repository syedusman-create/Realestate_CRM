import UserCampaignList from '@/components/dialer/user-campaign-list'
import UserSessionCard from '@/components/dialer/user-session-card'

import type {
  UserCampaignView,
  UserDialerSessionView,
} from '@/lib/crm/dialer/types'

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
      .from('dialer_campaigns')
      .select(
        `
          id,
          name,
          description,
          status,
          dialing_mode,
          distribution_mode
        `,
      )
      .eq('status', 'running')
      .order('name'),

    supabase
      .from('dialer_sessions')
      .select(
        `
          id,
          campaign_id,
          status,
          started_at,
          paused_at,
          current_queue_item_id,
          device_id,
          last_heartbeat_at
        `,
      )
      .eq('agent_id', user.id)
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
    campaignsResult.data ?? []

  const rawSession =
    sessionResult.data

  const campaignIds =
    campaigns.map(
      (campaign) =>
        campaign.id,
    )

  const [
    memberRowsResult,
    queueRowsResult,
    completedRowsResult,
    callbackRowsResult,
    todayCallsResult,
  ] = await Promise.all([
    campaignIds.length
      ? supabase
          .from(
            'dialer_campaign_members',
          )
          .select(
            'campaign_id',
          )
          .in(
            'campaign_id',
            campaignIds,
          )
          .eq(
            'is_active',
            true,
          )
      : Promise.resolve({
          data: [],
          error: null,
        }),

    campaignIds.length
      ? supabase
          .from(
            'dialer_campaign_leads',
          )
          .select(
            'campaign_id, status, attempt_count',
          )
          .in(
            'campaign_id',
            campaignIds,
          )
      : Promise.resolve({
          data: [],
          error: null,
        }),

    campaignIds.length
      ? supabase
          .from(
            'dialer_campaign_leads',
          )
          .select(
            'campaign_id',
          )
          .in(
            'campaign_id',
            campaignIds,
          )
          .eq(
            'status',
            'completed',
          )
      : Promise.resolve({
          data: [],
          error: null,
        }),

    campaignIds.length
      ? supabase
          .from(
            'dialer_campaign_leads',
          )
          .select(
            'campaign_id',
          )
          .in(
            'campaign_id',
            campaignIds,
          )
          .eq(
            'status',
            'callback',
          )
      : Promise.resolve({
          data: [],
          error: null,
        }),

    supabase
      .from('calls')
      .select(
        'id, outcome, started_at',
      )
      .eq(
        'agent_id',
        user.id,
      )
      .eq(
        'direction',
        'outbound',
      )
      .gte(
        'started_at',
        startOfToday(),
      ),
  ])

  if (memberRowsResult.error) {
    throw new Error(
      memberRowsResult.error.message,
    )
  }

  if (queueRowsResult.error) {
    throw new Error(
      queueRowsResult.error.message,
    )
  }

  if (completedRowsResult.error) {
    throw new Error(
      completedRowsResult.error.message,
    )
  }

  if (callbackRowsResult.error) {
    throw new Error(
      callbackRowsResult.error.message,
    )
  }

  if (todayCallsResult.error) {
    throw new Error(
      todayCallsResult.error.message,
    )
  }

  const memberRows =
    memberRowsResult.data ?? []

  const queueRows =
    queueRowsResult.data ?? []

  const completedRows =
    completedRowsResult.data ?? []

  const callbackRows =
    callbackRowsResult.data ?? []

  const todayCalls =
    todayCallsResult.data ?? []

  const campaignsView: UserCampaignView[] =
    campaigns.map(
      (campaign) => {
        const queue =
          queueRows.filter(
            (row) =>
              row.campaign_id ===
              campaign.id,
          )

        const completed =
          completedRows.filter(
            (row) =>
              row.campaign_id ===
              campaign.id,
          ).length

        const callbacks =
          callbackRows.filter(
            (row) =>
              row.campaign_id ===
              campaign.id,
          ).length

        return {
          id: campaign.id,
          name: campaign.name,
          description:
            campaign.description,
          status: campaign.status,
          dialingMode:
            campaign.dialing_mode,
          distributionMode:
            campaign.distribution_mode,
          memberCount:
            memberRows.filter(
              (row) =>
                row.campaign_id ===
                campaign.id,
            ).length,
          metrics: {
            total: queue.length,
            completed,
            remaining: Math.max(
              queue.length -
                completed,
              0,
            ),
            callbacks,
            attempts:
              queue.reduce(
                (
                  total,
                  item,
                ) =>
                  total +
                  item.attempt_count,
                0,
              ),
          },
          activity: {
            callsToday:
              todayCalls.length,
            connectedToday:
              todayCalls.filter(
                (call) =>
                  call.outcome ===
                  'connected',
              ).length,
            noAnswerToday:
              todayCalls.filter(
                (call) =>
                  call.outcome ===
                  'no_answer',
              ).length,
            callbacksToday:
              todayCalls.filter(
                (call) =>
                  call.outcome ===
                  'callback_requested',
              ).length,
          },
          isMember: true,
        }
      },
    )

  const activeCampaign =
    rawSession
      ? campaignsView.find(
          (campaign) =>
            campaign.id ===
            rawSession.campaign_id,
        ) ?? null
      : null

  const session: UserDialerSessionView | null =
    rawSession
      ? {
          id: rawSession.id,
          campaignId:
            rawSession.campaign_id,
          status:
            rawSession.status as UserDialerSessionView['status'],
          startedAt:
            rawSession.started_at,
          pausedAt:
            rawSession.paused_at,
          currentQueueItemId:
            rawSession.current_queue_item_id,
          deviceId:
            rawSession.device_id,
          lastHeartbeatAt:
            rawSession.last_heartbeat_at,
        }
      : null

  return (
    <main className="space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Dialer
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Calling workspace
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Work your assigned campaign queues from one
          workspace. Calling execution happens through
          the connected calling device.
        </p>
      </header>

      {activeCampaign &&
      session ? (
        <UserSessionCard
          campaign={
            activeCampaign
          }
          session={session}
        />
      ) : null}

      <UserCampaignList
        campaigns={
          campaignsView
        }
        activeCampaignId={
          session?.campaignId ??
          null
        }
      />
    </main>
  )
}

function startOfToday() {
  const date =
    new Date()

  date.setHours(
    0,
    0,
    0,
    0,
  )

  return date.toISOString()
}