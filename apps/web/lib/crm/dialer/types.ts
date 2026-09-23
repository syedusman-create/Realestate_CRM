import type { Tables } from '@realestate-crm/database'

export type DialerCampaign =
  Tables<'dialer_campaigns'>

export type DialerCampaignLead =
  Tables<'dialer_campaign_leads'>

export type DialerCampaignMember =
  Tables<'dialer_campaign_members'>

export type DialerSession =
  Tables<'dialer_sessions'>

export type DialerCallEvent =
  Tables<'dialer_call_events'>

export type CampaignDistributionMode =
  | 'equal_split'
  | 'round_robin'
  | 'on_demand'

export const CAMPAIGN_DISTRIBUTION_MODES = [
  'equal_split',
  'round_robin',
  'on_demand',
] as const satisfies readonly CampaignDistributionMode[]

export type DialerCampaignStatus =
  | 'draft'
  | 'running'
  | 'paused'
  | 'completed'
  | 'archived'

export type DialerSessionStatus =
  | 'running'
  | 'paused'
  | 'stopped'

export type DialerQueueStatus =
  | 'queued'
  | 'dialing'
  | 'connected'
  | 'completed'
  | 'callback'
  | 'failed'
  | 'dnc'
  | 'busy'
  | 'no_answer'
  | 'wrong_number'
  | 'voicemail'

export type DialerMode =
  | 'assisted'
  | 'preview'
  | 'power'

export const CAMPAIGN_STATUSES = [
  'draft',
  'running',
  'paused',
  'completed',
  'archived',
] as const satisfies readonly DialerCampaignStatus[]

export const DIALER_MODES = [
  'assisted',
  'preview',
  'power',
] as const satisfies readonly DialerMode[]

export type CampaignMemberUser = {
  id: string
  full_name: string
  role: string
  is_active?: boolean
}

export type CampaignEditorCampaign = {
  id: string
  name: string
  description: string | null
  distribution_mode: CampaignDistributionMode
  round_robin_cursor: number
  dialing_mode: DialerMode
  max_attempts: number
  retry_after_minutes: number
  allow_callbacks: boolean
  allow_voicemail: boolean
}

export type CampaignMemberView =
  DialerCampaignMember & {
    user: CampaignMemberUser
  }

export type DialerActionState = {
  ok: boolean
  message: string
  id?: string
}

export const EMPTY_DIALER_ACTION_STATE: DialerActionState = {
  ok: true,
  message: '',
}

export type CampaignListItem =
  DialerCampaign & {
    queue_count: number
    completed_count: number
    callback_count: number
  }

export type CampaignQueueItem =
  DialerCampaignLead & {
    person_name: string
    phone_number: string
  }

export type CampaignAvailableLead = {
  id: string
  person_id: string
  person_name: string
  temperature: string
  priority: string
}

export type CampaignAdminMetrics = {
  totalCampaigns: number
  running: number
  draft: number
  paused: number
  queued: number
  completed: number
  callbacks: number
}

export type CampaignQueueMetrics = {
  total: number
  queued: number
  dialing: number
  connected: number
  completed: number
  callbacks: number
  failed: number
  dnc: number
}

/* -------------------------------------------------------------------------- */
/* User dialer workspace                                                      */
/* -------------------------------------------------------------------------- */

export type UserCampaignMetrics = {
  total: number
  completed: number
  remaining: number
  callbacks: number
  attempts: number
}

export type UserCampaignActivity = {
  callsToday: number
  connectedToday: number
  noAnswerToday: number
  callbacksToday: number
}

export type UserCampaignView = {
  id: string
  name: string
  description: string | null
  status: DialerCampaignStatus
  dialingMode: DialerMode
  distributionMode: CampaignDistributionMode
  memberCount: number
  metrics: UserCampaignMetrics
  activity: UserCampaignActivity
  isMember: boolean
}

export type UserDialerSessionView = {
  id: string
  campaignId: string
  status: DialerSessionStatus
  startedAt: string
  pausedAt: string | null
  currentQueueItemId: string | null
  deviceId: string | null
  lastHeartbeatAt: string
}

export type DeviceConnectionState =
  | 'connected'
  | 'disconnected'
  | 'waiting'
  | 'unknown'

export type UserCampaignWorkspaceData = {
  campaign: UserCampaignView
  session: UserDialerSessionView | null
  deviceState: DeviceConnectionState
}

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

export function campaignStatusLabel(value: string) {
  switch (value) {
    case 'running':
      return 'Running'

    case 'paused':
      return 'Paused'

    case 'completed':
      return 'Completed'

    case 'archived':
      return 'Archived'

    case 'draft':
    default:
      return 'Draft'
  }
}

export function dialerModeLabel(value: string) {
  switch (value) {
    case 'preview':
      return 'Preview'

    case 'power':
      return 'Power'

    case 'assisted':
    default:
      return 'Assisted'
  }
}

export function distributionModeLabel(value: string) {
  switch (value) {
    case 'equal_split':
      return 'Equal split'

    case 'round_robin':
      return 'Round robin'

    case 'on_demand':
      return 'On demand'

    default:
      return value
  }
}

export function distributionModeDescription(value: string) {
  switch (value) {
    case 'equal_split':
      return 'Divide newly added leads as evenly as possible across active campaign members.'

    case 'round_robin':
      return 'Assign leads sequentially across active campaign members using the campaign cursor.'

    case 'on_demand':
      return 'Keep leads unassigned until a campaign member claims the next available lead.'

    default:
      return ''
  }
}

export function queueStatusLabel(value: string) {
  switch (value) {
    case 'dialing':
      return 'Dialing'

    case 'connected':
      return 'Connected'

    case 'completed':
      return 'Completed'

    case 'callback':
      return 'Callback'

    case 'failed':
      return 'Failed'

    case 'dnc':
      return 'Do Not Call'

    case 'busy':
      return 'Busy'

    case 'no_answer':
      return 'No answer'

    case 'wrong_number':
      return 'Wrong number'

    case 'voicemail':
      return 'Voicemail'

    case 'queued':
    default:
      return 'Queued'
  }
}