export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
export type CallOutcome = 'connected' | 'not_connected' | 'busy' | 'no_answer' | 'wrong_number' | 'voicemail' | 'callback_requested'
export type LeadPriority = 'low' | 'normal' | 'high' | 'urgent'
export type LeadTemperature = 'cold' | 'warm' | 'hot'
export type PersonStatus = 'active' | 'inactive' | 'do_not_contact' | 'merged'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'skipped'
export type TaskType = 'call' | 'followup' | 'callback' | 'send_properties' | 'confirm_viewing' | 'viewing_followup' | 'send_documents' | 'negotiation' | 'custom'
export type UnitStatus = 'available' | 'reserved' | 'sold' | 'leased' | 'under_maintenance' | 'off_market'
export type ProjectStatus = 'upcoming' | 'pre_launch' | 'launched' | 'under_construction' | 'ready_to_move' | 'completed' | 'sold_out' | 'inactive'
export type PropertyCategory = 'primary_sale' | 'resale' | 'rental'
export type PropertyType = 'apartment' | 'villa' | 'plot' | 'independent_house' | 'row_house' | 'commercial' | 'office' | 'retail' | 'other'
export type Furnishing = 'unfurnished' | 'semi_furnished' | 'fully_furnished'
export type ListingType = 'primary_sale' | 'resale' | 'rent' | 'lease'
export type ListingStatus = 'draft' | 'active' | 'reserved' | 'under_offer' | 'closed' | 'expired' | 'withdrawn'
export type RequirementType = 'buy' | 'rent' | 'resale' | 'lease'
export type PurposeType = 'end_use' | 'investment' | 'rental_income' | 'resale'
export type PropertyInteraction = 'viewed' | 'shared' | 'clicked' | 'interested' | 'shortlisted' | 'rejected' | 'visited' | 'enquired' | 'offered' | 'purchased'
export type LocationType = 'country' | 'state' | 'city' | 'zone' | 'locality' | 'sub_locality' | 'micro_market' | 'landmark'
export type DealStageType = 'qualification' | 'viewing' | 'offer_made' | 'under_contract' | 'closed_won' | 'closed_lost'

export interface TenantRow { id: string; tenant_code: string; name: string; is_active: boolean | null; created_at: string | null; updated_at: string | null }
export interface UserRow { id: string; tenant_code: string; full_name: string; email: string | null; phone: string | null; role: string; is_active: boolean | null; workspace_id: string | null; created_at: string | null; updated_at: string | null }
export interface WorkspaceRow { id: string; tenant_code: string | null; name: string; slug: string; created_at: string | null; updated_at: string | null }
export interface PersonRow { id: string; tenant_id: string; workspace_id: string | null; first_name: string | null; last_name: string | null; display_name: string; occupation: string | null; company_name: string | null; preferred_language: string | null; notes: string | null; status: PersonStatus; merged_into_person_id: string | null; created_at: string; updated_at: string }
export interface PersonPhoneRow { id: string; person_id: string; phone_number: string; normalized_phone: string; phone_type: string; is_primary: boolean; is_whatsapp: boolean; verified_at: string | null; created_at: string }
export interface LeadRow { id: string; tenant_id: string; workspace_id: string | null; person_id: string; assigned_user_id: string | null; pipeline_id: string | null; status_id: string | null; priority: LeadPriority; temperature: LeadTemperature; lead_score: number | null; first_contact_at: string | null; last_contact_at: string | null; next_followup_at: string | null; closed_at: string | null; lost_reason: string | null; notes: string | null; metadata: Json; created_at: string; updated_at: string }
export interface CallRow { id: string; tenant_id: string; workspace_id: string | null; lead_id: string; person_id: string; agent_id: string | null; direction: string; started_at: string; ended_at: string | null; duration_seconds: number | null; outcome: CallOutcome; disposition: string | null; sub_disposition: string | null; notes: string | null; recording_url: string | null; created_at: string }
export interface TaskRow { id: string; tenant_id: string; workspace_id: string | null; assigned_to: string | null; lead_id: string | null; person_id: string | null; task_type: TaskType; title: string; description: string | null; priority: LeadPriority; scheduled_at: string; due_at: string | null; completed_at: string | null; status: TaskStatus; source_activity_id: string | null; metadata: Json; created_at: string; updated_at: string }
export interface DeveloperRow { id: string; name: string; slug: string; website: string | null; logo_url: string | null; description: string | null; established_year: number | null; headquarters: string | null; metadata: Json; created_at: string; updated_at: string }
export interface LocationRow { id: string; parent_location_id: string | null; name: string; slug: string; location_type: LocationType; city: string | null; state: string | null; country: string | null; latitude: number | null; longitude: number | null; aliases: string[]; metadata: Json; created_at: string; updated_at: string }
export interface ProjectRow { id: string; developer_id: string | null; name: string; slug: string; property_category: PropertyCategory; property_type: PropertyType; location_id: string | null; address_line_1: string | null; address_line_2: string | null; city: string | null; state: string | null; postal_code: string | null; latitude: number | null; longitude: number | null; land_area_sqft: number | null; total_units: number | null; total_towers: number | null; total_floors: number | null; status: ProjectStatus; launch_date: string | null; possession_date: string | null; rera_number: string | null; description: string | null; highlights: string | null; price_min: number | null; price_max: number | null; metadata: Json; created_at: string; updated_at: string }
export interface ProjectConfigurationRow { id: string; project_id: string; phase_id: string | null; configuration_name: string; bedrooms: number; bathrooms: number | null; carpet_area_min: number | null; carpet_area_max: number | null; builtup_area_min: number | null; builtup_area_max: number | null; super_builtup_area_min: number | null; super_builtup_area_max: number | null; price_min: number | null; price_max: number | null; price_per_sqft_min: number | null; price_per_sqft_max: number | null; total_available_units: number; metadata: Json; created_at: string; updated_at: string }
export interface UnitRow { id: string; project_id: string; phase_id: string | null; tower_id: string | null; configuration_id: string | null; unit_number: string; floor_number: number | null; carpet_area_sqft: number | null; builtup_area_sqft: number | null; super_builtup_area_sqft: number | null; balcony_area_sqft: number | null; bedrooms: number | null; bathrooms: number | null; facing: string | null; parking_count: number | null; asking_price: number | null; price_per_sqft: number | null; status: UnitStatus; owner_person_id: string | null; metadata: Json; created_at: string; updated_at: string }
export interface ListingRow { id: string; tenant_id: string; unit_id: string; listing_type: ListingType; agent_id: string | null; status: ListingStatus; asking_price: number | null; rent_amount: number | null; deposit_amount: number | null; maintenance_amount: number | null; available_from: string | null; furnishing: Furnishing | null; description: string | null; published_at: string | null; expires_at: string | null; created_at: string; updated_at: string }
export interface PropertyMediaRow { id: string; project_id: string | null; unit_id: string | null; listing_id: string | null; media_type: string; platform: string | null; url: string; thumbnail_url: string | null; title: string | null; description: string | null; is_primary: boolean; sort_order: number; created_at: string }
export interface DialerCampaignRow { id: string; tenant_id: string; workspace_id: string | null; name: string; description: string | null; status: 'draft' | 'running' | 'paused' | 'completed' | 'archived'; dialing_mode: 'assisted' | 'automatic'; max_attempts: number; retry_after_minutes: number; allow_callbacks: boolean; allow_voicemail: boolean; quiet_hours: Json; compliance_config: Json; created_by: string | null; created_at: string; updated_at: string }
export interface DialerCampaignLeadRow { id: string; tenant_id: string; campaign_id: string; lead_id: string; person_id: string; phone_id: string; status: 'queued' | 'dialing' | 'connected' | 'no_answer' | 'busy' | 'wrong_number' | 'voicemail' | 'callback' | 'completed' | 'skipped' | 'dnc' | 'failed'; attempt_count: number; priority: number; next_attempt_at: string | null; last_attempt_at: string | null; claimed_by: string | null; claimed_at: string | null; completed_at: string | null; metadata: Json; created_at: string; updated_at: string }
export interface DialerSessionRow { id: string; tenant_id: string; workspace_id: string | null; campaign_id: string; agent_id: string; status: 'running' | 'paused' | 'stopped'; device_id: string | null; current_queue_item_id: string | null; started_at: string; paused_at: string | null; stopped_at: string | null; last_heartbeat_at: string; stats: Json; created_at: string; updated_at: string }
export interface DialerCallEventRow { id: string; tenant_id: string; session_id: string | null; queue_item_id: string | null; lead_id: string | null; person_id: string | null; call_id: string | null; agent_id: string | null; direction: 'inbound' | 'outbound'; event_type: string; event_at: string; normalized_phone: string | null; source: string; external_event_id: string | null; duration_seconds: number | null; raw_payload: Json; created_at: string }
export interface RecommendationRow { recommendation_run_id: string; rank: number; total_score: number; project_id: string; project_name: string; developer_name: string | null; location_name: string | null; unit_id: string | null; unit_number: string | null; listing_id: string | null; price: number | null; bedrooms: number | null; bathrooms: number | null; area_sqft: number | null; facing: string | null; floor_number: number | null; reasons: Json }
export interface LeadDashboardRow { lead_id: string; person_id: string; person_name: string; phone: string | null; email: string | null; assigned_user_id: string | null; assigned_user_name: string | null; priority: LeadPriority | null; temperature: LeadTemperature | null; lead_score: number | null; pipeline_name: string | null; pipeline_id: string | null; status_id: string | null; stage_name: string | null; notes: string | null; created_at: string | null; updated_at: string | null; first_contact_at: string | null; last_contact_at: string | null; next_followup_at: string | null; next_task_due_at: string | null; call_count: number | null; closed_at: string | null; tenant_id: string | null; workspace_id: string | null }
export interface TenantDashboardMetricsRow { tenant_id: string | null; tenant_code: string | null; tenant_name: string | null; open_leads: number | null; hot_leads: number | null; calls_last_24h: number | null; overdue_tasks: number | null; tasks_next_24h: number | null; active_projects: number | null; available_units: number | null; active_listings: number | null; total_leads: number | null }
export interface LeadSourcePerformanceRow { source_id: string | null; source_name: string | null; platform: string | null; tenant_id: string | null; leads: number | null; open_leads: number | null; closed_hot_leads: number | null; avg_lead_score: number | null }
export interface LeadActivityTimelineRow { lead_id: string; activity_id: string; activity_type: 'call' | 'task' | 'property_share' | 'property_interaction' | 'status_change' | 'assignment_change'; occurred_at: string; title: string; detail: string | null; actor_name: string | null }

export interface Database {
  public: {
    Tables: {
      tenants: { Row: TenantRow; Insert: Partial<TenantRow> & Pick<TenantRow, 'name' | 'tenant_code'>; Update: Partial<TenantRow>; Relationships: [] }
      users: { Row: UserRow; Insert: UserRow; Update: Partial<UserRow>; Relationships: [] }
      workspaces: { Row: WorkspaceRow; Insert: Omit<WorkspaceRow, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<WorkspaceRow, 'id' | 'created_at' | 'updated_at'>>; Update: Partial<WorkspaceRow>; Relationships: [] }
      people: { Row: PersonRow; Insert: PersonRow; Update: Partial<PersonRow>; Relationships: [] }
      person_phones: { Row: PersonPhoneRow; Insert: PersonPhoneRow; Update: Partial<PersonPhoneRow>; Relationships: [] }
      leads: { Row: LeadRow; Insert: LeadRow; Update: Partial<LeadRow>; Relationships: [] }
      calls: { Row: CallRow; Insert: CallRow; Update: Partial<CallRow>; Relationships: [] }
      tasks: { Row: TaskRow; Insert: TaskRow; Update: Partial<TaskRow>; Relationships: [] }
      developers: { Row: DeveloperRow; Insert: Partial<DeveloperRow> & Pick<DeveloperRow, 'name' | 'slug'>; Update: Partial<DeveloperRow>; Relationships: [] }
      locations: { Row: LocationRow; Insert: Partial<LocationRow> & Pick<LocationRow, 'name' | 'slug' | 'location_type'>; Update: Partial<LocationRow>; Relationships: [] }
      projects: { Row: ProjectRow; Insert: Partial<ProjectRow> & Pick<ProjectRow, 'name' | 'slug' | 'property_category' | 'property_type'>; Update: Partial<ProjectRow>; Relationships: [] }
      project_configurations: { Row: ProjectConfigurationRow; Insert: Partial<ProjectConfigurationRow> & Pick<ProjectConfigurationRow, 'project_id' | 'configuration_name' | 'bedrooms'>; Update: Partial<ProjectConfigurationRow>; Relationships: [] }
      units: { Row: UnitRow; Insert: Partial<UnitRow> & Pick<UnitRow, 'project_id' | 'unit_number'>; Update: Partial<UnitRow>; Relationships: [] }
      listings: { Row: ListingRow; Insert: Partial<ListingRow> & Pick<ListingRow, 'tenant_id' | 'unit_id' | 'listing_type'>; Update: Partial<ListingRow>; Relationships: [] }
      property_media: { Row: PropertyMediaRow; Insert: Partial<PropertyMediaRow> & Pick<PropertyMediaRow, 'url'>; Update: Partial<PropertyMediaRow>; Relationships: [] }
      dialer_campaigns: { Row: DialerCampaignRow; Insert: Partial<DialerCampaignRow> & Pick<DialerCampaignRow, 'tenant_id' | 'name'>; Update: Partial<DialerCampaignRow>; Relationships: [] }
      dialer_campaign_leads: { Row: DialerCampaignLeadRow; Insert: DialerCampaignLeadRow; Update: Partial<DialerCampaignLeadRow>; Relationships: [] }
      dialer_sessions: { Row: DialerSessionRow; Insert: Partial<DialerSessionRow> & Pick<DialerSessionRow, 'tenant_id' | 'campaign_id' | 'agent_id'>; Update: Partial<DialerSessionRow>; Relationships: [] }
      dialer_call_events: { Row: DialerCallEventRow; Insert: Partial<DialerCallEventRow> & Pick<DialerCallEventRow, 'tenant_id' | 'direction' | 'event_type'>; Update: Partial<DialerCallEventRow>; Relationships: [] }
    }
    Views: {
      lead_dashboard: { Row: LeadDashboardRow; Relationships: [] }
      tenant_dashboard_metrics: { Row: TenantDashboardMetricsRow; Insert: never; Update: never; Relationships: [] }
      lead_source_performance: { Row: LeadSourcePerformanceRow; Insert: never; Update: never; Relationships: [] }
      lead_activity_timeline: { Row: LeadActivityTimelineRow; Insert: never; Update: never; Relationships: [] }
    }
    Functions: {
      claim_next_dialer_item: { Args: { p_campaign_id: string; p_session_id: string }; Returns: Array<Pick<DialerCampaignLeadRow, 'id' | 'campaign_id' | 'lead_id' | 'person_id' | 'phone_id' | 'status' | 'attempt_count' | 'next_attempt_at' | 'claimed_by' | 'claimed_at' | 'priority'>> }
      find_inbound_callback: { Args: { p_normalized_phone: string }; Returns: Array<{ person_id: string; lead_id: string; assigned_user_id: string | null; campaign_id: string | null; campaign_name: string | null; last_attempt_at: string | null; last_call_id: string | null }> }
      get_property_recommendations: { Args: { p_lead_id: string; p_limit?: number }; Returns: RecommendationRow[] }
      run_property_recommendations: { Args: { p_lead_id: string; p_limit?: number }; Returns: string }
      crm_can_manage_tenant: { Args: Record<string, never>; Returns: boolean }
      crm_current_tenant_id: { Args: Record<string, never>; Returns: string }
      crm_current_user_role: { Args: Record<string, never>; Returns: string }
      crm_normalize_email: { Args: { p_email: string }; Returns: string }
      crm_normalize_phone: { Args: { p_phone: string }; Returns: string }
      ingest_lead: { Args: Record<string, unknown>; Returns: Array<{ assigned_user_id: string; is_existing_person: boolean; lead_id: string; owner_preserved: boolean; person_id: string }> }
      ensure_default_followup_sequence: { Args: { p_tenant_id: string; p_workspace_id?: string }; Returns: string }
      enroll_lead_followup: { Args: { p_lead_id: string; p_sequence_id?: string }; Returns: string }
      process_due_followups: { Args: { p_limit?: number }; Returns: number }
      reassign_lead: { Args: { p_lead_id: string; p_new_assigned_user_id: string; p_reason?: string | null }; Returns: string }
    }
    Enums: {
      allocation_strategy: 'round_robin' | 'equal_distribution' | 'on_demand'
      crm_call_outcome: CallOutcome
      crm_furnishing: Furnishing
      crm_lead_priority: LeadPriority
      crm_lead_temperature: LeadTemperature
      crm_listing_status: ListingStatus
      crm_listing_type: ListingType
      crm_location_type: LocationType
      crm_media_type: 'photo' | 'video' | 'floor_plan' | 'brochure' | 'price_sheet' | 'master_plan' | 'home_tour' | 'location_map' | 'document'
      crm_person_status: PersonStatus
      crm_processing_status: 'received' | 'processing' | 'processed' | 'duplicate' | 'failed' | 'ignored'
      crm_project_status: ProjectStatus
      crm_property_category: PropertyCategory
      crm_property_interaction: PropertyInteraction
      crm_property_type: PropertyType
      crm_purpose_type: PurposeType
      crm_requirement_type: RequirementType
      crm_task_status: TaskStatus
      crm_task_type: TaskType
      crm_unit_status: UnitStatus
      deal_stage_type: DealStageType
    }
    CompositeTypes: Record<string, unknown>
  }
}
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TableInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TableUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row']