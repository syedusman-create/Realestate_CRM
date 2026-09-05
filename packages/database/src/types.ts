export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type CallOutcome = 'connected' | 'not_connected' | 'busy' | 'no_answer' | 'wrong_number' | 'voicemail' | 'callback_requested'
export type LeadPriority = 'low' | 'normal' | 'high' | 'urgent'
export type LeadTemperature = 'cold' | 'warm' | 'hot'
export type PersonStatus = 'active' | 'inactive' | 'do_not_contact' | 'merged'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'skipped'
export type TaskType = 'call' | 'followup' | 'callback' | 'send_properties' | 'confirm_viewing' | 'viewing_followup' | 'send_documents' | 'negotiation' | 'custom'

export interface Database {
  public: {
    Tables: {
      tenants: { Row: { id: string; tenant_code: string; name: string; is_active: boolean | null; created_at: string | null; updated_at: string | null }; Insert: Omit<Tables<'tenants'>, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<Tables<'tenants'>, 'id' | 'created_at' | 'updated_at'>>; Update: Partial<Tables<'tenants'>>; Relationships: [] }
      users: { Row: { id: string; tenant_code: string; full_name: string; email: string | null; phone: string | null; role: string; is_active: boolean | null; workspace_id: string | null; created_at: string | null; updated_at: string | null }; Insert: Tables<'users'>; Update: Partial<Tables<'users'>>; Relationships: [] }
      workspaces: { Row: { id: string; tenant_code: string | null; name: string; slug: string; created_at: string | null; updated_at: string | null }; Insert: Tables<'workspaces'>; Update: Partial<Tables<'workspaces'>>; Relationships: [] }
      people: { Row: { id: string; tenant_id: string; workspace_id: string | null; first_name: string | null; last_name: string | null; display_name: string; occupation: string | null; company_name: string | null; preferred_language: string | null; notes: string | null; status: PersonStatus; merged_into_person_id: string | null; created_at: string; updated_at: string }; Insert: Tables<'people'>; Update: Partial<Tables<'people'>>; Relationships: [] }
      person_phones: { Row: { id: string; person_id: string; phone_number: string; normalized_phone: string; phone_type: string; is_primary: boolean; is_whatsapp: boolean; verified_at: string | null; created_at: string }; Insert: Tables<'person_phones'>; Update: Partial<Tables<'person_phones'>>; Relationships: [] }
      leads: { Row: { id: string; tenant_id: string; workspace_id: string | null; person_id: string; assigned_user_id: string | null; pipeline_id: string | null; status_id: string | null; priority: LeadPriority; temperature: LeadTemperature; lead_score: number | null; first_contact_at: string | null; last_contact_at: string | null; next_followup_at: string | null; closed_at: string | null; lost_reason: string | null; notes: string | null; metadata: Json; created_at: string; updated_at: string }; Insert: Tables<'leads'>; Update: Partial<Tables<'leads'>>; Relationships: [] }
      calls: { Row: { id: string; tenant_id: string; workspace_id: string | null; lead_id: string; person_id: string; agent_id: string | null; direction: string; started_at: string; ended_at: string | null; duration_seconds: number | null; outcome: CallOutcome; disposition: string | null; sub_disposition: string | null; notes: string | null; recording_url: string | null; created_at: string }; Insert: Tables<'calls'>; Update: Partial<Tables<'calls'>>; Relationships: [] }
      tasks: { Row: { id: string; tenant_id: string; workspace_id: string | null; assigned_to: string | null; lead_id: string | null; person_id: string | null; task_type: TaskType; title: string; description: string | null; priority: LeadPriority; scheduled_at: string; due_at: string | null; completed_at: string | null; status: TaskStatus; source_activity_id: string | null; metadata: Json; created_at: string; updated_at: string }; Insert: Tables<'tasks'>; Update: Partial<Tables<'tasks'>>; Relationships: [] }
    }
    Views: Record<string, unknown>
    Functions: Record<string, unknown>
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
