export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type CallOutcome = 'connected' | 'not_connected' | 'busy' | 'no_answer' | 'wrong_number' | 'voicemail' | 'callback_requested'
export type LeadPriority = 'low' | 'normal' | 'high' | 'urgent'
export type LeadTemperature = 'cold' | 'warm' | 'hot'
export type PersonStatus = 'active' | 'inactive' | 'do_not_contact' | 'merged'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'skipped'
export type TaskType = 'call' | 'followup' | 'callback' | 'send_properties' | 'confirm_viewing' | 'viewing_followup' | 'send_documents' | 'negotiation' | 'custom'

export interface TenantRow { id: string; tenant_code: string; name: string; is_active: boolean | null; created_at: string | null; updated_at: string | null }
export interface UserRow { id: string; tenant_code: string; full_name: string; email: string | null; phone: string | null; role: string; is_active: boolean | null; workspace_id: string | null; created_at: string | null; updated_at: string | null }
export interface WorkspaceRow { id: string; tenant_code: string | null; name: string; slug: string; created_at: string | null; updated_at: string | null }
export interface PersonRow { id: string; tenant_id: string; workspace_id: string | null; first_name: string | null; last_name: string | null; display_name: string; occupation: string | null; company_name: string | null; preferred_language: string | null; notes: string | null; status: PersonStatus; merged_into_person_id: string | null; created_at: string; updated_at: string }
export interface PersonPhoneRow { id: string; person_id: string; phone_number: string; normalized_phone: string; phone_type: string; is_primary: boolean; is_whatsapp: boolean; verified_at: string | null; created_at: string }
export interface LeadRow { id: string; tenant_id: string; workspace_id: string | null; person_id: string; assigned_user_id: string | null; pipeline_id: string | null; status_id: string | null; priority: LeadPriority; temperature: LeadTemperature; lead_score: number | null; first_contact_at: string | null; last_contact_at: string | null; next_followup_at: string | null; closed_at: string | null; lost_reason: string | null; notes: string | null; metadata: Json; created_at: string; updated_at: string }
export interface CallRow { id: string; tenant_id: string; workspace_id: string | null; lead_id: string; person_id: string; agent_id: string | null; direction: string; started_at: string; ended_at: string | null; duration_seconds: number | null; outcome: CallOutcome; disposition: string | null; sub_disposition: string | null; notes: string | null; recording_url: string | null; created_at: string }
export interface TaskRow { id: string; tenant_id: string; workspace_id: string | null; assigned_to: string | null; lead_id: string | null; person_id: string | null; task_type: TaskType; title: string; description: string | null; priority: LeadPriority; scheduled_at: string; due_at: string | null; completed_at: string | null; status: TaskStatus; source_activity_id: string | null; metadata: Json; created_at: string; updated_at: string }

export interface DeveloperRow { id: string; name: string; slug: string; website: string | null; logo_url: string | null; description: string | null; established_year: number | null; headquarters: string | null; metadata: Json; created_at: string; updated_at: string }
export interface LocationRow { id: string; parent_location_id: string | null; name: string; slug: string; location_type: string; city: string | null; state: string | null; country: string | null; latitude: number | null; longitude: number | null; aliases: string[]; metadata: Json; created_at: string; updated_at: string }
export interface ProjectRow {
  id: string; developer_id: string | null; name: string; slug: string; property_category: string; property_type: string; location_id: string | null;
  address_line_1: string | null; address_line_2: string | null; city: string | null; state: string | null; postal_code: string | null;
  latitude: number | null; longitude: number | null; land_area_sqft: number | null; total_units: number | null; total_towers: number | null;
  total_floors: number | null; status: string; launch_date: string | null; possession_date: string | null; rera_number: string | null;
  description: string | null; highlights: string | null; price_min: number | null; price_max: number | null; metadata: Json; created_at: string; updated_at: string
}
export interface ProjectConfigurationRow { id: string; project_id: string; phase_id: string | null; configuration_name: string; bedrooms: number; bathrooms: number | null; carpet_area_min: number | null; carpet_area_max: number | null; builtup_area_min: number | null; builtup_area_max: number | null; super_builtup_area_min: number | null; super_builtup_area_max: number | null; price_min: number | null; price_max: number | null; price_per_sqft_min: number | null; price_per_sqft_max: number | null; total_available_units: number; metadata: Json; created_at: string; updated_at: string }
export interface UnitRow { id: string; project_id: string; phase_id: string | null; tower_id: string | null; configuration_id: string | null; unit_number: string; floor_number: number | null; carpet_area_sqft: number | null; builtup_area_sqft: number | null; super_builtup_area_sqft: number | null; balcony_area_sqft: number | null; bedrooms: number | null; bathrooms: number | null; facing: string | null; parking_count: number | null; asking_price: number | null; price_per_sqft: number | null; status: string; owner_person_id: string | null; metadata: Json; created_at: string; updated_at: string }
export interface ListingRow { id: string; tenant_id: string; unit_id: string; listing_type: string; agent_id: string | null; status: string; asking_price: number | null; rent_amount: number | null; deposit_amount: number | null; maintenance_amount: number | null; available_from: string | null; furnishing: string | null; description: string | null; published_at: string | null; expires_at: string | null; created_at: string; updated_at: string }
export interface PropertyMediaRow { id: string; project_id: string | null; unit_id: string | null; listing_id: string | null; media_type: string; platform: string | null; url: string; thumbnail_url: string | null; title: string | null; description: string | null; is_primary: boolean; sort_order: number; created_at: string }

export interface DialerCampaignRow {
  id: string; tenant_id: string; workspace_id: string | null; name: string; description: string | null;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived'; dialing_mode: 'assisted' | 'automatic';
  max_attempts: number; retry_after_minutes: number; allow_callbacks: boolean; allow_voicemail: boolean;
  quiet_hours: Json; compliance_config: Json; created_by: string | null; created_at: string; updated_at: string
}
export interface DialerCampaignLeadRow {
  id: string; tenant_id: string; campaign_id: string; lead_id: string; person_id: string; phone_id: string;
  status: 'queued' | 'dialing' | 'connected' | 'no_answer' | 'busy' | 'wrong_number' | 'voicemail' | 'callback' | 'completed' | 'skipped' | 'dnc' | 'failed';
  attempt_count: number; priority: number; next_attempt_at: string | null; last_attempt_at: string | null;
  claimed_by: string | null; claimed_at: string | null; completed_at: string | null; metadata: Json; created_at: string; updated_at: string
}
export interface DialerSessionRow { id: string; tenant_id: string; workspace_id: string | null; campaign_id: string; agent_id: string; status: 'running' | 'paused' | 'stopped'; device_id: string | null; current_queue_item_id: string | null; started_at: string; paused_at: string | null; stopped_at: string | null; last_heartbeat_at: string; stats: Json; created_at: string; updated_at: string }
export interface DialerCallEventRow { id: string; tenant_id: string; session_id: string | null; queue_item_id: string | null; lead_id: string | null; person_id: string | null; call_id: string | null; agent_id: string | null; direction: 'inbound' | 'outbound'; event_type: 'initiated' | 'ringing' | 'connected' | 'ended' | 'missed' | 'failed' | 'rejected' | 'no_answer' | 'callback_detected'; event_at: string; normalized_phone: string | null; source: string; external_event_id: string | null; duration_seconds: number | null; raw_payload: Json; created_at: string }

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
    Views: Record<string, unknown>
    Functions: {
      claim_next_dialer_item: { Args: { p_campaign_id: string; p_session_id: string }; Returns: Array<Pick<DialerCampaignLeadRow, 'id' | 'campaign_id' | 'lead_id' | 'person_id' | 'phone_id' | 'status' | 'attempt_count' | 'next_attempt_at' | 'claimed_by' | 'claimed_at' | 'priority'>> }
      find_inbound_callback: { Args: { p_normalized_phone: string }; Returns: Array<{ person_id: string; lead_id: string; assigned_user_id: string | null; campaign_id: string | null; campaign_name: string | null; last_attempt_at: string | null; last_call_id: string | null }> }
    }
    Enums: {
      crm_call_outcome: CallOutcome
      crm_lead_priority: LeadPriority
      crm_lead_temperature: LeadTemperature
      crm_person_status: PersonStatus
      crm_task_status: TaskStatus
      crm_task_type: TaskType
    }
    CompositeTypes: Record<string, unknown>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TableInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TableUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
