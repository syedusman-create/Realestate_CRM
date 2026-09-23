import type {
  CallOutcome,
  LeadPriority,
  LeadTemperature,
  RecommendationRow,
  RequirementRow,
  Tables,
  Views,
} from '@realestate-crm/database'

/*
 * Database row aliases
 *
 * Keep these aliases here so the Leads feature has one stable place
 * for its database-facing types.
 */

export type LeadRow = Tables<'leads'>

export type PersonRow = Tables<'people'>

export type PhoneRow = Tables<'person_phones'>

export type CallRow = Tables<'calls'>

export type TaskRow = Tables<'tasks'>

export type PipelineRow = Tables<'pipelines'>

export type PipelineStageRow =
  Tables<'pipeline_stages'>

export type LeadDashboard =
  Views<'lead_dashboard'>

export type LeadActivity =
  Views<'lead_activity_timeline'>

export type Recommendation =
  RecommendationRow

export type Requirement =
  RequirementRow

/*
 * Lead value types
 */

export type LeadPriorityValue =
  LeadPriority

export type LeadTemperatureValue =
  LeadTemperature

export const LEAD_PRIORITIES = [
  'low',
  'normal',
  'high',
  'urgent',
] as const

export const LEAD_TEMPERATURES = [
  'cold',
  'warm',
  'hot',
] as const

/*
 * Requirement values
 */

export const REQUIREMENT_TYPES = [
  'buy',
  'rent',
  'resale',
  'lease',
] as const

export const PURPOSES = [
  '',
  'end_use',
  'investment',
  'rental_income',
  'resale',
] as const

export const FURNISHINGS = [
  '',
  'unfurnished',
  'semi_furnished',
  'fully_furnished',
] as const

/*
 * Lead list
 */

export type LeadFilterTemperature =
  | 'all'
  | LeadTemperatureValue

export type LeadListFilters = {
  q: string
  temperature: LeadFilterTemperature
  page: number
}

export type LeadListItem =
  LeadDashboard

/*
 * Server action state
 */

export type LeadActionState = {
  ok: boolean
  message: string
}

export const EMPTY_ACTION_STATE: LeadActionState = {
  ok: true,
  message: '',
}

/*
 * Property-share action state
 */

export type ShareMatchesState = {
  ok: boolean
  message: string
  whatsappUrl?: string
}

/*
 * Detail-page data
 */

export type LeadDetailData = {
  lead: LeadRow
  person: PersonRow
  primaryPhone: PhoneRow | null
  requirement: Requirement | null
  calls: CallRow[]
  tasks: TaskRow[]
  stages: PipelineStageRow[]
  activities: LeadActivity[]
  recommendations: Recommendation[]
  agents: Array<{
    id: string
    full_name: string
    role: string
  }>
  assignedUser: {
    id: string
    full_name: string
    role: string
  } | null
  canManage: boolean
}

/*
 * Call outcome is re-exported through a feature-friendly name.
 */

export type LeadCallOutcome = CallOutcome