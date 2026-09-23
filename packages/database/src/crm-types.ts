import type {
  Database,
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
  Json,
} from './types'

export type TableRow<
  T extends keyof Database['public']['Tables'],
> = Database['public']['Tables'][T]['Row']

export type TableInsert<
  T extends keyof Database['public']['Tables'],
> = Database['public']['Tables'][T]['Insert']

export type TableUpdate<
  T extends keyof Database['public']['Tables'],
> = Database['public']['Tables'][T]['Update']

export type ViewRow<
  T extends keyof Database['public']['Views'],
> = Database['public']['Views'][T]['Row']

export type Views<
  T extends keyof Database['public']['Views'],
> = Database['public']['Views'][T]['Row']

// Live database enums
export type CallOutcome = Enums<'crm_call_outcome'>
export type LeadPriority = Enums<'crm_lead_priority'>
export type LeadTemperature = Enums<'crm_lead_temperature'>
export type PersonStatus = Enums<'crm_person_status'>
export type TaskStatus = Enums<'crm_task_status'>
export type TaskType = Enums<'crm_task_type'>
export type UnitStatus = Enums<'crm_unit_status'>
export type ProjectStatus = Enums<'crm_project_status'>
export type PropertyCategory = Enums<'crm_property_category'>
export type PropertyType = Enums<'crm_property_type'>
export type Furnishing = Enums<'crm_furnishing'>
export type ListingType = Enums<'crm_listing_type'>
export type ListingStatus = Enums<'crm_listing_status'>
export type RequirementType = Enums<'crm_requirement_type'>
export type PurposeType = Enums<'crm_purpose_type'>
export type PropertyInteraction = Enums<'crm_property_interaction'>
export type LocationType = Enums<'crm_location_type'>
export type DealStageType = Enums<'deal_stage_type'>

// Live table aliases
export type PersonRow = Tables<'people'>
export type LeadRow = Tables<'leads'>
export type RequirementRow = Tables<'requirements'>
export type TaskRow = Tables<'tasks'>
export type CallRow = Tables<'calls'>
export type DealRow = Tables<'deals'>
export type PipelineRow = Tables<'pipelines'>
export type PipelineStageRow = Tables<'pipeline_stages'>
export type RecommendationRow = {
  recommendation_run_id: string
  rank: number
  total_score: number
  project_id: string
  project_name: string
  developer_name: string | null
  location_name: string | null
  unit_id: string | null
  unit_number: string | null
  listing_id: string | null
  price: number | null
  bedrooms: number | null
  bathrooms: number | null
  area_sqft: number | null
  facing: string | null
  floor_number: number | null
  reasons: Json
}

// Insert/update aliases
export type TaskInsert = TablesInsert<'tasks'>
export type TaskUpdate = TablesUpdate<'tasks'>

export type DealInsert = TablesInsert<'deals'>
export type DealUpdate = TablesUpdate<'deals'>

export type RequirementInsert = TablesInsert<'requirements'>
export type RequirementUpdate = TablesUpdate<'requirements'>