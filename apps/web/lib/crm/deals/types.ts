import type {
  DealStageType,
  PipelineStageRow,
  Tables,
} from '@realestate-crm/database'

export type DealRow = Tables<'deals'>

export type DealStage = PipelineStageRow

export type DealPipelineRow = {
  deal_id: string
  tenant_id: string
  workspace_id: string | null
  lead_id: string
  deal_name: string
  deal_value: number | null
  expected_close_date: string | null
  probability: number | null
  status: string
  lost_reason: string | null
  notes: string | null
  created_at: string
  updated_at: string
  closed_at: string | null
  owner_user_id: string | null
  owner_name: string | null
  pipeline_id: string | null
  pipeline_name: string | null
  stage_id: string | null
  stage_name: string | null
  stage_type: DealStageType | null
  display_order: number | null
  stage_probability: number | null
  person_name: string
  assigned_user_id: string | null
}

export type DealStatus = 'open' | 'won' | 'lost' | 'paused'

export const DEAL_STATUSES = [
  'open',
  'won',
  'lost',
  'paused',
] as const

export const DEAL_STAGE_TYPES = [
  'qualification',
  'viewing',
  'offer_made',
  'under_contract',
  'closed_won',
  'closed_lost',
] as const

export type DealListFilters = {
  q: string
  status: 'all' | DealStatus
  page: number
}

export type DealMetrics = {
  total: number
  open: number
  won: number
  lost: number
  paused: number
  openValue: number
  weightedValue: number
  wonValue: number
}

export type DealActionState = {
  ok: boolean
  message: string
}

export const EMPTY_DEAL_ACTION_STATE: DealActionState = {
  ok: true,
  message: '',
}

export type DealEditorData = {
  deal: DealRow
  stages: DealStage[]
  agents: Array<{
    id: string
    full_name: string
    role: string
  }>
}