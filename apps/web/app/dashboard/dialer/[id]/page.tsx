import Link from 'next/link'
import { notFound } from 'next/navigation'

import UserCampaignWorkspace from '@/components/dialer/user-campaign-workspace'

import type {
  DeviceConnectionState,
  UserCampaignView,
  UserDialerSessionView,
} from '@/lib/crm/dialer/types'

import { createClient } from '@/lib/supabase/server'

type Params = {
  id: string
}

const HEARTBEAT_TIMEOUT_MS =
  90_000

export default async function DialerCampaignPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { id } = await params

  const supabase =
    await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: campaign, error } =
    await supabase
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
      .eq('id', id)
      .eq('status', 'running')
      .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!campaign) {
    notFound()
  }

  const [
    membershipResult,
    memberCountResult,
    queueResult,
    completedResult,
    callbackResult,
    attemptsResult,
    callsTodayResult,
    connectedTodayResult,
    noAnswerTodayResult,
    callbacksTodayResult,
    sessionResult,
  ] = await Promise.all([
    supabase
      .from('dialer_campaign_members')
      .select('id')
      .eq('campaign_id', id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle(),

    supabase
      .from('dialer_campaign_members')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('campaign_id', id)
      .eq('is_active', true),

    supabase
      .from('dialer_campaign_leads')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('campaign_id', id),

    supabase
      .from('dialer_campaign_leads')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('campaign_id', id)
      .eq('status', 'completed'),

    supabase
      .from('dialer_campaign_leads')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('campaign_id', id)
      .eq('status', 'callback'),

    supabase
      .from('dialer_campaign_leads')
      .select('attempt_count')
      .eq('campaign_id', id),

    supabase
      .from('calls')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('agent_id', user.id)
      .eq('direction', 'outbound')
      .gte(
        'started_at',
        startOfToday(),
      ),

    supabase
      .from('calls')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('agent_id', user.id)
      .eq('direction', 'outbound')
      .eq('outcome', 'connected')
      .gte(
        'started_at',
        startOfToday(),
      ),

    supabase
      .from('calls')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('agent_id', user.id)
      .eq('direction', 'outbound')
      .eq('outcome', 'no_answer')
      .gte(
        'started_at',
        startOfToday(),
      ),

    supabase
      .from('calls')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('agent_id', user.id)
      .eq('direction', 'outbound')
      .eq('outcome', 'callback_requested')
      .gte(
        'started_at',
        startOfToday(),
      ),

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
      .eq('campaign_id', id)
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

  if (membershipResult.error) {
    throw new Error(
      membershipResult.error.message,
    )
  }

  if (!membershipResult.data) {
    notFound()
  }

  if (memberCountResult.error) {
    throw new Error(
      memberCountResult.error.message,
    )
  }

  if (queueResult.error) {
    throw new Error(
      queueResult.error.message,
    )
  }

  if (completedResult.error) {
    throw new Error(
      completedResult.error.message,
    )
  }

  if (callbackResult.error) {
    throw new Error(
      callbackResult.error.message,
    )
  }

  if (attemptsResult.error) {
    throw new Error(
      attemptsResult.error.message,
    )
  }

  if (callsTodayResult.error) {
    throw new Error(
      callsTodayResult.error.message,
    )
  }

  if (connectedTodayResult.error) {
    throw new Error(
      connectedTodayResult.error.message,
    )
  }

  if (noAnswerTodayResult.error) {
    throw new Error(
      noAnswerTodayResult.error.message,
    )
  }

  if (callbacksTodayResult.error) {
    throw new Error(
      callbacksTodayResult.error.message,
    )
  }

  if (sessionResult.error) {
    throw new Error(
      sessionResult.error.message,
    )
  }

  const total =
    queueResult.count ?? 0

  const completed =
    completedResult.count ?? 0

  const remaining = Math.max(
    total - completed,
    0,
  )

  const attempts =
    (attemptsResult.data ?? []).reduce(
      (sum, item) =>
        sum + item.attempt_count,
      0,
    )

  const campaignView: UserCampaignView =
    {
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
        memberCountResult.count ?? 0,
      metrics: {
        total,
        completed,
        remaining,
        callbacks:
          callbackResult.count ?? 0,
        attempts,
      },
      activity: {
        callsToday:
          callsTodayResult.count ?? 0,
        connectedToday:
          connectedTodayResult.count ?? 0,
        noAnswerToday:
          noAnswerTodayResult.count ?? 0,
        callbacksToday:
          callbacksTodayResult.count ?? 0,
      },
      isMember: true,
    }

  const rawSession =
    sessionResult.data

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

  const deviceState =
    getDeviceState(session)

  return (
    <main className="space-y-6">
      <Link
        href="/dashboard/dialer"
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to campaigns
      </Link>

      <UserCampaignWorkspace
        data={{
          campaign:
            campaignView,
          session,
          deviceState,
        }}
      />
    </main>
  )
}

function getDeviceState(
  session: UserDialerSessionView | null,
): DeviceConnectionState {
  if (!session) {
    return 'waiting'
  }

  if (!session.deviceId) {
    return 'waiting'
  }

  const heartbeat =
    new Date(
      session.lastHeartbeatAt,
    ).getTime()

  if (
    Date.now() - heartbeat >
    HEARTBEAT_TIMEOUT_MS
  ) {
    return 'disconnected'
  }

  return 'connected'
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