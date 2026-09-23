export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          agent_id: string | null
          created_at: string
          direction: string
          disposition: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          lead_id: string
          notes: string | null
          outcome: Database["public"]["Enums"]["crm_call_outcome"]
          person_id: string
          recording_url: string | null
          started_at: string
          sub_disposition: string | null
          tenant_id: string
          workspace_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          direction?: string
          disposition?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          outcome: Database["public"]["Enums"]["crm_call_outcome"]
          person_id: string
          recording_url?: string | null
          started_at?: string
          sub_disposition?: string | null
          tenant_id: string
          workspace_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          direction?: string
          disposition?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          outcome?: Database["public"]["Enums"]["crm_call_outcome"]
          person_id?: string
          recording_url?: string | null
          started_at?: string
          sub_disposition?: string | null
          tenant_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "calls_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "calls_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "calls_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_share_items: {
        Row: {
          created_at: string
          id: string
          listing_id: string | null
          project_id: string | null
          share_id: string
          unit_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id?: string | null
          project_id?: string | null
          share_id: string
          unit_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string | null
          project_id?: string | null
          share_id?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_share_items_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_share_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_share_items_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "communication_shares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_share_items_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_shares: {
        Row: {
          agent_id: string | null
          channel: string
          created_at: string
          id: string
          lead_id: string | null
          message_body: string
          message_template_id: string | null
          person_id: string
          tenant_id: string
        }
        Insert: {
          agent_id?: string | null
          channel: string
          created_at?: string
          id?: string
          lead_id?: string | null
          message_body: string
          message_template_id?: string | null
          person_id: string
          tenant_id: string
        }
        Update: {
          agent_id?: string | null
          channel?: string
          created_at?: string
          id?: string
          lead_id?: string | null
          message_body?: string
          message_template_id?: string | null
          person_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_shares_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_shares_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "communication_shares_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_shares_message_template_id_fkey"
            columns: ["message_template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_shares_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "communication_shares_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_shares_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "communication_shares_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_import_jobs: {
        Row: {
          column_mapping: Json
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_summary: Json
          file_name: string
          id: string
          import_type: string
          imported_rows: number
          invalid_rows: number
          skipped_rows: number
          started_at: string | null
          status: string
          tenant_id: string
          total_rows: number
          valid_rows: number
          workspace_id: string | null
        }
        Insert: {
          column_mapping?: Json
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_summary?: Json
          file_name: string
          id?: string
          import_type: string
          imported_rows?: number
          invalid_rows?: number
          skipped_rows?: number
          started_at?: string | null
          status?: string
          tenant_id: string
          total_rows?: number
          valid_rows?: number
          workspace_id?: string | null
        }
        Update: {
          column_mapping?: Json
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_summary?: Json
          file_name?: string
          id?: string
          import_type?: string
          imported_rows?: number
          invalid_rows?: number
          skipped_rows?: number
          started_at?: string | null
          status?: string
          tenant_id?: string
          total_rows?: number
          valid_rows?: number
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_import_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_import_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "crm_import_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_import_jobs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          closed_at: string | null
          created_at: string
          deal_name: string
          deal_value: number | null
          expected_close_date: string | null
          id: string
          lead_id: string
          lost_reason: string | null
          notes: string | null
          owner_user_id: string | null
          pipeline_id: string | null
          probability: number | null
          stage_id: string | null
          status: string
          tenant_id: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          deal_name: string
          deal_value?: number | null
          expected_close_date?: string | null
          id?: string
          lead_id: string
          lost_reason?: string | null
          notes?: string | null
          owner_user_id?: string | null
          pipeline_id?: string | null
          probability?: number | null
          stage_id?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          deal_name?: string
          deal_value?: number | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string
          lost_reason?: string | null
          notes?: string | null
          owner_user_id?: string | null
          pipeline_id?: string | null
          probability?: number | null
          stage_id?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "lead_dashboard"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "sales_funnel_performance"
            referencedColumns: ["stage_id"]
          },
          {
            foreignKeyName: "deals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "deals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      developers: {
        Row: {
          created_at: string
          description: string | null
          established_year: number | null
          headquarters: string | null
          id: string
          logo_url: string | null
          metadata: Json
          name: string
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          established_year?: number | null
          headquarters?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json
          name: string
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          established_year?: number | null
          headquarters?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json
          name?: string
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      dialer_call_events: {
        Row: {
          agent_id: string | null
          call_id: string | null
          created_at: string
          direction: string
          duration_seconds: number | null
          event_at: string
          event_type: string
          external_event_id: string | null
          id: string
          lead_id: string | null
          normalized_phone: string | null
          person_id: string | null
          queue_item_id: string | null
          raw_payload: Json
          session_id: string | null
          source: string
          tenant_id: string
        }
        Insert: {
          agent_id?: string | null
          call_id?: string | null
          created_at?: string
          direction: string
          duration_seconds?: number | null
          event_at?: string
          event_type: string
          external_event_id?: string | null
          id?: string
          lead_id?: string | null
          normalized_phone?: string | null
          person_id?: string | null
          queue_item_id?: string | null
          raw_payload?: Json
          session_id?: string | null
          source?: string
          tenant_id: string
        }
        Update: {
          agent_id?: string | null
          call_id?: string | null
          created_at?: string
          direction?: string
          duration_seconds?: number | null
          event_at?: string
          event_type?: string
          external_event_id?: string | null
          id?: string
          lead_id?: string | null
          normalized_phone?: string | null
          person_id?: string | null
          queue_item_id?: string | null
          raw_payload?: Json
          session_id?: string | null
          source?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dialer_call_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_call_events_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_call_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "dialer_call_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_call_events_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "dialer_call_events_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_call_events_queue_item_id_fkey"
            columns: ["queue_item_id"]
            isOneToOne: false
            referencedRelation: "dialer_campaign_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_call_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dialer_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_call_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "dialer_call_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dialer_campaign_leads: {
        Row: {
          assigned_at: string | null
          assigned_user_id: string | null
          assignment_reason: string | null
          attempt_count: number
          campaign_id: string
          claimed_at: string | null
          claimed_by: string | null
          completed_at: string | null
          created_at: string
          id: string
          last_attempt_at: string | null
          lead_id: string
          metadata: Json
          next_attempt_at: string | null
          person_id: string
          phone_id: string
          priority: number
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_user_id?: string | null
          assignment_reason?: string | null
          attempt_count?: number
          campaign_id: string
          claimed_at?: string | null
          claimed_by?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          lead_id: string
          metadata?: Json
          next_attempt_at?: string | null
          person_id: string
          phone_id: string
          priority?: number
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_user_id?: string | null
          assignment_reason?: string | null
          attempt_count?: number
          campaign_id?: string
          claimed_at?: string | null
          claimed_by?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          lead_id?: string
          metadata?: Json
          next_attempt_at?: string | null
          person_id?: string
          phone_id?: string
          priority?: number
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dialer_campaign_leads_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_campaign_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "dialer_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_campaign_leads_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_campaign_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "dialer_campaign_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_campaign_leads_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "dialer_campaign_leads_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_campaign_leads_phone_id_fkey"
            columns: ["phone_id"]
            isOneToOne: false
            referencedRelation: "person_phones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_campaign_leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "dialer_campaign_leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dialer_campaign_members: {
        Row: {
          campaign_id: string
          created_at: string
          distribution_order: number
          id: string
          is_active: boolean
          tenant_id: string
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          distribution_order?: number
          id?: string
          is_active?: boolean
          tenant_id: string
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          distribution_order?: number
          id?: string
          is_active?: boolean
          tenant_id?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dialer_campaign_members_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "dialer_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_campaign_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "dialer_campaign_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_campaign_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_campaign_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      dialer_campaigns: {
        Row: {
          allow_callbacks: boolean
          allow_voicemail: boolean
          compliance_config: Json
          created_at: string
          created_by: string | null
          description: string | null
          dialing_mode: string
          distribution_mode: string
          id: string
          max_attempts: number
          name: string
          quiet_hours: Json
          retry_after_minutes: number
          round_robin_cursor: number
          status: string
          tenant_id: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          allow_callbacks?: boolean
          allow_voicemail?: boolean
          compliance_config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          dialing_mode?: string
          distribution_mode?: string
          id?: string
          max_attempts?: number
          name: string
          quiet_hours?: Json
          retry_after_minutes?: number
          round_robin_cursor?: number
          status?: string
          tenant_id: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          allow_callbacks?: boolean
          allow_voicemail?: boolean
          compliance_config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          dialing_mode?: string
          distribution_mode?: string
          id?: string
          max_attempts?: number
          name?: string
          quiet_hours?: Json
          retry_after_minutes?: number
          round_robin_cursor?: number
          status?: string
          tenant_id?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dialer_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "dialer_campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      dialer_sessions: {
        Row: {
          agent_id: string
          campaign_id: string
          created_at: string
          current_queue_item_id: string | null
          device_id: string | null
          id: string
          last_heartbeat_at: string
          paused_at: string | null
          started_at: string
          stats: Json
          status: string
          stopped_at: string | null
          tenant_id: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          agent_id: string
          campaign_id: string
          created_at?: string
          current_queue_item_id?: string | null
          device_id?: string | null
          id?: string
          last_heartbeat_at?: string
          paused_at?: string | null
          started_at?: string
          stats?: Json
          status?: string
          stopped_at?: string | null
          tenant_id: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          agent_id?: string
          campaign_id?: string
          created_at?: string
          current_queue_item_id?: string | null
          device_id?: string | null
          id?: string
          last_heartbeat_at?: string
          paused_at?: string | null
          started_at?: string
          stats?: Json
          status?: string
          stopped_at?: string | null
          tenant_id?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dialer_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_sessions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "dialer_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_sessions_current_queue_item_id_fkey"
            columns: ["current_queue_item_id"]
            isOneToOne: false
            referencedRelation: "dialer_campaign_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "dialer_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_sessions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      duplicate_candidates: {
        Row: {
          confidence: number
          created_at: string
          entity_type: string
          id: string
          match_type: string
          record_a_id: string
          record_b_id: string
          resolution: string | null
          resolved_at: string | null
          reviewed_by: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          confidence: number
          created_at?: string
          entity_type: string
          id?: string
          match_type: string
          record_a_id: string
          record_b_id: string
          resolution?: string | null
          resolved_at?: string | null
          reviewed_by?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          entity_type?: string
          id?: string
          match_type?: string
          record_a_id?: string
          record_b_id?: string
          resolution?: string | null
          resolved_at?: string | null
          reviewed_by?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "duplicate_candidates_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duplicate_candidates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "duplicate_candidates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_embeddings: {
        Row: {
          content_hash: string
          created_at: string
          embedding: string | null
          entity_id: string
          entity_type: string
          id: string
          model: string
          updated_at: string
        }
        Insert: {
          content_hash: string
          created_at?: string
          embedding?: string | null
          entity_id: string
          entity_type: string
          id?: string
          model: string
          updated_at?: string
        }
        Update: {
          content_hash?: string
          created_at?: string
          embedding?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          model?: string
          updated_at?: string
        }
        Relationships: []
      }
      followup_sequence_steps: {
        Row: {
          channel: string
          created_at: string
          delay_minutes: number
          description: string | null
          id: string
          is_active: boolean
          priority: Database["public"]["Enums"]["crm_lead_priority"]
          sequence_id: string
          step_order: number
          task_type: Database["public"]["Enums"]["crm_task_type"]
          title: string
        }
        Insert: {
          channel?: string
          created_at?: string
          delay_minutes: number
          description?: string | null
          id?: string
          is_active?: boolean
          priority?: Database["public"]["Enums"]["crm_lead_priority"]
          sequence_id: string
          step_order: number
          task_type?: Database["public"]["Enums"]["crm_task_type"]
          title: string
        }
        Update: {
          channel?: string
          created_at?: string
          delay_minutes?: number
          description?: string | null
          id?: string
          is_active?: boolean
          priority?: Database["public"]["Enums"]["crm_lead_priority"]
          sequence_id?: string
          step_order?: number
          task_type?: Database["public"]["Enums"]["crm_task_type"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "followup_sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "followup_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      followup_sequences: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          tenant_id: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          tenant_id: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "followup_sequences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "followup_sequences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followup_sequences_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_allocation_settings: {
        Row: {
          active_agent_ids: string[] | null
          created_at: string | null
          id: string
          last_assigned_index: number | null
          strategy: Database["public"]["Enums"]["allocation_strategy"] | null
          tenant_code: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          active_agent_ids?: string[] | null
          created_at?: string | null
          id?: string
          last_assigned_index?: number | null
          strategy?: Database["public"]["Enums"]["allocation_strategy"] | null
          tenant_code?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          active_agent_ids?: string[] | null
          created_at?: string | null
          id?: string
          last_assigned_index?: number | null
          strategy?: Database["public"]["Enums"]["allocation_strategy"] | null
          tenant_code?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_allocation_settings_tenant_code_fkey"
            columns: ["tenant_code"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_code"]
          },
          {
            foreignKeyName: "lead_allocation_settings_tenant_code_fkey"
            columns: ["tenant_code"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_code"]
          },
          {
            foreignKeyName: "lead_allocation_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_assignments: {
        Row: {
          assigned_by: string | null
          assigned_to: string
          assignment_type: string
          created_at: string
          ended_at: string | null
          id: string
          lead_id: string
          reason: string | null
          started_at: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_to: string
          assignment_type?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          lead_id: string
          reason?: string | null
          started_at?: string
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string
          assignment_type?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          lead_id?: string
          reason?: string | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "lead_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_followup_enrollments: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: number
          id: string
          lead_id: string
          next_run_at: string | null
          sequence_id: string
          started_at: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          lead_id: string
          next_run_at?: string | null
          sequence_id: string
          started_at?: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          lead_id?: string
          next_run_at?: string | null
          sequence_id?: string
          started_at?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_followup_enrollments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "lead_followup_enrollments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_followup_enrollments_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "followup_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_followup_enrollments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "lead_followup_enrollments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_ingestion_events: {
        Row: {
          error_message: string | null
          event_type: string
          external_event_id: string | null
          id: string
          payload: Json
          processed_at: string | null
          processing_status: Database["public"]["Enums"]["crm_processing_status"]
          received_at: string
          retry_count: number
          source_id: string | null
          tenant_id: string | null
        }
        Insert: {
          error_message?: string | null
          event_type: string
          external_event_id?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          processing_status?: Database["public"]["Enums"]["crm_processing_status"]
          received_at?: string
          retry_count?: number
          source_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          error_message?: string | null
          event_type?: string
          external_event_id?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          processing_status?: Database["public"]["Enums"]["crm_processing_status"]
          received_at?: string
          retry_count?: number
          source_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_ingestion_events_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "lead_source_performance"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "lead_ingestion_events_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_ingestion_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "lead_ingestion_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_source_records: {
        Row: {
          created_at: string
          external_ad_id: string | null
          external_campaign_id: string | null
          external_form_id: string | null
          external_lead_id: string | null
          id: string
          lead_id: string
          raw_payload: Json
          received_at: string
          source_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          external_ad_id?: string | null
          external_campaign_id?: string | null
          external_form_id?: string | null
          external_lead_id?: string | null
          id?: string
          lead_id: string
          raw_payload?: Json
          received_at?: string
          source_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          external_ad_id?: string | null
          external_campaign_id?: string | null
          external_form_id?: string | null
          external_lead_id?: string | null
          id?: string
          lead_id?: string
          raw_payload?: Json
          received_at?: string
          source_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_source_records_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "lead_source_records_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_source_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "lead_source_performance"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "lead_source_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_source_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "lead_source_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          configuration: Json
          created_at: string
          id: string
          is_active: boolean
          name: string
          platform: string
          source_type: string
          tenant_id: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          platform: string
          source_type: string
          tenant_id: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          platform?: string
          source_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_sources_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "lead_sources_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status_id: string | null
          id: string
          lead_id: string
          reason: string | null
          to_status_id: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status_id?: string | null
          id?: string
          lead_id: string
          reason?: string | null
          to_status_id?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status_id?: string | null
          id?: string
          lead_id?: string
          reason?: string | null
          to_status_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_status_history_from_status_id_fkey"
            columns: ["from_status_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_status_history_from_status_id_fkey"
            columns: ["from_status_id"]
            isOneToOne: false
            referencedRelation: "sales_funnel_performance"
            referencedColumns: ["stage_id"]
          },
          {
            foreignKeyName: "lead_status_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "lead_status_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_status_history_to_status_id_fkey"
            columns: ["to_status_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_status_history_to_status_id_fkey"
            columns: ["to_status_id"]
            isOneToOne: false
            referencedRelation: "sales_funnel_performance"
            referencedColumns: ["stage_id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_user_id: string | null
          closed_at: string | null
          created_at: string
          first_contact_at: string | null
          id: string
          last_contact_at: string | null
          lead_score: number | null
          lost_reason: string | null
          metadata: Json
          next_followup_at: string | null
          notes: string | null
          person_id: string
          pipeline_id: string | null
          priority: Database["public"]["Enums"]["crm_lead_priority"]
          status_id: string | null
          temperature: Database["public"]["Enums"]["crm_lead_temperature"]
          tenant_id: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          assigned_user_id?: string | null
          closed_at?: string | null
          created_at?: string
          first_contact_at?: string | null
          id?: string
          last_contact_at?: string | null
          lead_score?: number | null
          lost_reason?: string | null
          metadata?: Json
          next_followup_at?: string | null
          notes?: string | null
          person_id: string
          pipeline_id?: string | null
          priority?: Database["public"]["Enums"]["crm_lead_priority"]
          status_id?: string | null
          temperature?: Database["public"]["Enums"]["crm_lead_temperature"]
          tenant_id: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          assigned_user_id?: string | null
          closed_at?: string | null
          created_at?: string
          first_contact_at?: string | null
          id?: string
          last_contact_at?: string | null
          lead_score?: number | null
          lost_reason?: string | null
          metadata?: Json
          next_followup_at?: string | null
          notes?: string | null
          person_id?: string
          pipeline_id?: string | null
          priority?: Database["public"]["Enums"]["crm_lead_priority"]
          status_id?: string | null
          temperature?: Database["public"]["Enums"]["crm_lead_temperature"]
          tenant_id?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "leads_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "sales_funnel_performance"
            referencedColumns: ["stage_id"]
          },
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          agent_id: string | null
          asking_price: number | null
          available_from: string | null
          created_at: string
          deposit_amount: number | null
          description: string | null
          expires_at: string | null
          furnishing: Database["public"]["Enums"]["crm_furnishing"] | null
          id: string
          listing_type: Database["public"]["Enums"]["crm_listing_type"]
          maintenance_amount: number | null
          published_at: string | null
          rent_amount: number | null
          status: Database["public"]["Enums"]["crm_listing_status"]
          tenant_id: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          asking_price?: number | null
          available_from?: string | null
          created_at?: string
          deposit_amount?: number | null
          description?: string | null
          expires_at?: string | null
          furnishing?: Database["public"]["Enums"]["crm_furnishing"] | null
          id?: string
          listing_type: Database["public"]["Enums"]["crm_listing_type"]
          maintenance_amount?: number | null
          published_at?: string | null
          rent_amount?: number | null
          status?: Database["public"]["Enums"]["crm_listing_status"]
          tenant_id: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          asking_price?: number | null
          available_from?: string | null
          created_at?: string
          deposit_amount?: number | null
          description?: string | null
          expires_at?: string | null
          furnishing?: Database["public"]["Enums"]["crm_furnishing"] | null
          id?: string
          listing_type?: Database["public"]["Enums"]["crm_listing_type"]
          maintenance_amount?: number | null
          published_at?: string | null
          rent_amount?: number | null
          status?: Database["public"]["Enums"]["crm_listing_status"]
          tenant_id?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "listings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          aliases: string[]
          boundary: unknown
          city: string | null
          country: string | null
          created_at: string
          id: string
          latitude: number | null
          location_type: Database["public"]["Enums"]["crm_location_type"]
          longitude: number | null
          metadata: Json
          name: string
          parent_location_id: string | null
          slug: string
          state: string | null
          updated_at: string
        }
        Insert: {
          aliases?: string[]
          boundary?: unknown
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          location_type: Database["public"]["Enums"]["crm_location_type"]
          longitude?: number | null
          metadata?: Json
          name: string
          parent_location_id?: string | null
          slug: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          aliases?: string[]
          boundary?: unknown
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          location_type?: Database["public"]["Enums"]["crm_location_type"]
          longitude?: number | null
          metadata?: Json
          name?: string
          parent_location_id?: string | null
          slug?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_parent_location_id_fkey"
            columns: ["parent_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          channel: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          template_body: string
          tenant_id: string
          updated_at: string
          variables: Json
        }
        Insert: {
          channel: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          template_body: string
          tenant_id: string
          updated_at?: string
          variables?: Json
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          template_body?: string
          tenant_id?: string
          updated_at?: string
          variables?: Json
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "message_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ownership_records: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_primary_owner: boolean
          ownership_percentage: number
          person_id: string
          start_date: string | null
          unit_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_primary_owner?: boolean
          ownership_percentage?: number
          person_id: string
          start_date?: string | null
          unit_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_primary_owner?: boolean
          ownership_percentage?: number
          person_id?: string
          start_date?: string | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ownership_records_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "ownership_records_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ownership_records_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          company_name: string | null
          created_at: string
          display_name: string
          first_name: string | null
          id: string
          last_name: string | null
          merged_into_person_id: string | null
          notes: string | null
          occupation: string | null
          preferred_language: string | null
          status: Database["public"]["Enums"]["crm_person_status"]
          tenant_id: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          display_name: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          merged_into_person_id?: string | null
          notes?: string | null
          occupation?: string | null
          preferred_language?: string | null
          status?: Database["public"]["Enums"]["crm_person_status"]
          tenant_id: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          display_name?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          merged_into_person_id?: string | null
          notes?: string | null
          occupation?: string | null
          preferred_language?: string | null
          status?: Database["public"]["Enums"]["crm_person_status"]
          tenant_id?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "people_merged_into_person_id_fkey"
            columns: ["merged_into_person_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "people_merged_into_person_id_fkey"
            columns: ["merged_into_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "people_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      person_emails: {
        Row: {
          created_at: string
          email: string
          email_type: string
          id: string
          is_primary: boolean
          normalized_email: string
          person_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          email_type?: string
          id?: string
          is_primary?: boolean
          normalized_email: string
          person_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          email_type?: string
          id?: string
          is_primary?: boolean
          normalized_email?: string
          person_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "person_emails_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "person_emails_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      person_phones: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          is_whatsapp: boolean
          normalized_phone: string
          person_id: string
          phone_number: string
          phone_type: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          is_whatsapp?: boolean
          normalized_phone: string
          person_id: string
          phone_number: string
          phone_type?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          is_whatsapp?: boolean
          normalized_phone?: string
          person_id?: string
          phone_number?: string
          phone_type?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "person_phones_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "person_phones_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          name: string
          pipeline_id: string
          stage_type: Database["public"]["Enums"]["deal_stage_type"]
          win_probability: number | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          name: string
          pipeline_id: string
          stage_type: Database["public"]["Enums"]["deal_stage_type"]
          win_probability?: number | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          name?: string
          pipeline_id?: string
          stage_type?: Database["public"]["Enums"]["deal_stage_type"]
          win_probability?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          tenant_code: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          tenant_code?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          tenant_code?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_tenant_code_fkey"
            columns: ["tenant_code"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_code"]
          },
          {
            foreignKeyName: "pipelines_tenant_code_fkey"
            columns: ["tenant_code"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_code"]
          },
          {
            foreignKeyName: "pipelines_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      project_configurations: {
        Row: {
          bathrooms: number | null
          bedrooms: number
          builtup_area_max: number | null
          builtup_area_min: number | null
          carpet_area_max: number | null
          carpet_area_min: number | null
          configuration_name: string
          created_at: string
          id: string
          metadata: Json
          phase_id: string | null
          price_max: number | null
          price_min: number | null
          price_per_sqft_max: number | null
          price_per_sqft_min: number | null
          project_id: string
          super_builtup_area_max: number | null
          super_builtup_area_min: number | null
          total_available_units: number
          updated_at: string
        }
        Insert: {
          bathrooms?: number | null
          bedrooms: number
          builtup_area_max?: number | null
          builtup_area_min?: number | null
          carpet_area_max?: number | null
          carpet_area_min?: number | null
          configuration_name: string
          created_at?: string
          id?: string
          metadata?: Json
          phase_id?: string | null
          price_max?: number | null
          price_min?: number | null
          price_per_sqft_max?: number | null
          price_per_sqft_min?: number | null
          project_id: string
          super_builtup_area_max?: number | null
          super_builtup_area_min?: number | null
          total_available_units?: number
          updated_at?: string
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number
          builtup_area_max?: number | null
          builtup_area_min?: number | null
          carpet_area_max?: number | null
          carpet_area_min?: number | null
          configuration_name?: string
          created_at?: string
          id?: string
          metadata?: Json
          phase_id?: string | null
          price_max?: number | null
          price_min?: number | null
          price_per_sqft_max?: number | null
          price_per_sqft_min?: number | null
          project_id?: string
          super_builtup_area_max?: number | null
          super_builtup_area_min?: number | null
          total_available_units?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_configurations_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_configurations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_phases: {
        Row: {
          created_at: string
          description: string | null
          id: string
          land_area_sqft: number | null
          launch_date: string | null
          metadata: Json
          name: string
          phase_number: number | null
          possession_date: string | null
          project_id: string
          rera_number: string | null
          status: Database["public"]["Enums"]["crm_project_status"]
          total_units: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          land_area_sqft?: number | null
          launch_date?: string | null
          metadata?: Json
          name: string
          phase_number?: number | null
          possession_date?: string | null
          project_id: string
          rera_number?: string | null
          status?: Database["public"]["Enums"]["crm_project_status"]
          total_units?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          land_area_sqft?: number | null
          launch_date?: string | null
          metadata?: Json
          name?: string
          phase_number?: number | null
          possession_date?: string | null
          project_id?: string
          rera_number?: string | null
          status?: Database["public"]["Enums"]["crm_project_status"]
          total_units?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_towers: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          name: string
          phase_id: string
          status: Database["public"]["Enums"]["crm_project_status"]
          total_floors: number | null
          total_units: number | null
          tower_code: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          phase_id: string
          status?: Database["public"]["Enums"]["crm_project_status"]
          total_floors?: number | null
          total_units?: number | null
          tower_code?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          phase_id?: string
          status?: Database["public"]["Enums"]["crm_project_status"]
          total_floors?: number | null
          total_units?: number | null
          tower_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_towers_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          city: string | null
          created_at: string
          description: string | null
          developer_id: string | null
          highlights: string | null
          id: string
          land_area_sqft: number | null
          latitude: number | null
          launch_date: string | null
          location_id: string | null
          longitude: number | null
          metadata: Json
          name: string
          possession_date: string | null
          postal_code: string | null
          price_max: number | null
          price_min: number | null
          property_category: Database["public"]["Enums"]["crm_property_category"]
          property_type: Database["public"]["Enums"]["crm_property_type"]
          rera_number: string | null
          slug: string
          state: string | null
          status: Database["public"]["Enums"]["crm_project_status"]
          total_floors: number | null
          total_towers: number | null
          total_units: number | null
          updated_at: string
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          developer_id?: string | null
          highlights?: string | null
          id?: string
          land_area_sqft?: number | null
          latitude?: number | null
          launch_date?: string | null
          location_id?: string | null
          longitude?: number | null
          metadata?: Json
          name: string
          possession_date?: string | null
          postal_code?: string | null
          price_max?: number | null
          price_min?: number | null
          property_category?: Database["public"]["Enums"]["crm_property_category"]
          property_type?: Database["public"]["Enums"]["crm_property_type"]
          rera_number?: string | null
          slug: string
          state?: string | null
          status?: Database["public"]["Enums"]["crm_project_status"]
          total_floors?: number | null
          total_towers?: number | null
          total_units?: number | null
          updated_at?: string
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          developer_id?: string | null
          highlights?: string | null
          id?: string
          land_area_sqft?: number | null
          latitude?: number | null
          launch_date?: string | null
          location_id?: string | null
          longitude?: number | null
          metadata?: Json
          name?: string
          possession_date?: string | null
          postal_code?: string | null
          price_max?: number | null
          price_min?: number | null
          property_category?: Database["public"]["Enums"]["crm_property_category"]
          property_type?: Database["public"]["Enums"]["crm_property_type"]
          rera_number?: string | null
          slug?: string
          state?: string | null
          status?: Database["public"]["Enums"]["crm_project_status"]
          total_floors?: number | null
          total_towers?: number | null
          total_units?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      property_feedback: {
        Row: {
          created_at: string
          created_by: string | null
          feedback_type: string
          id: string
          interaction_id: string | null
          lead_id: string | null
          notes: string | null
          person_id: string
          project_id: string | null
          reason: string | null
          score: number | null
          tenant_id: string
          unit_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          feedback_type: string
          id?: string
          interaction_id?: string | null
          lead_id?: string | null
          notes?: string | null
          person_id: string
          project_id?: string | null
          reason?: string | null
          score?: number | null
          tenant_id: string
          unit_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          feedback_type?: string
          id?: string
          interaction_id?: string | null
          lead_id?: string | null
          notes?: string | null
          person_id?: string
          project_id?: string | null
          reason?: string | null
          score?: number | null
          tenant_id?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_feedback_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_feedback_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "property_interactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_feedback_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "property_feedback_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_feedback_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "property_feedback_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_feedback_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_feedback_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "property_feedback_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_feedback_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      property_interactions: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          interaction_type: Database["public"]["Enums"]["crm_property_interaction"]
          lead_id: string | null
          listing_id: string | null
          notes: string | null
          person_id: string
          project_id: string | null
          source: string | null
          tenant_id: string
          unit_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          interaction_type: Database["public"]["Enums"]["crm_property_interaction"]
          lead_id?: string | null
          listing_id?: string | null
          notes?: string | null
          person_id: string
          project_id?: string | null
          source?: string | null
          tenant_id: string
          unit_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          interaction_type?: Database["public"]["Enums"]["crm_property_interaction"]
          lead_id?: string | null
          listing_id?: string | null
          notes?: string | null
          person_id?: string
          project_id?: string | null
          source?: string | null
          tenant_id?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_interactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "property_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_interactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_interactions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "property_interactions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_interactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_interactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "property_interactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_interactions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      property_media: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_primary: boolean
          listing_id: string | null
          media_type: Database["public"]["Enums"]["crm_media_type"]
          platform: string | null
          project_id: string | null
          sort_order: number
          thumbnail_url: string | null
          title: string | null
          unit_id: string | null
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_primary?: boolean
          listing_id?: string | null
          media_type: Database["public"]["Enums"]["crm_media_type"]
          platform?: string | null
          project_id?: string | null
          sort_order?: number
          thumbnail_url?: string | null
          title?: string | null
          unit_id?: string | null
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_primary?: boolean
          listing_id?: string | null
          media_type?: Database["public"]["Enums"]["crm_media_type"]
          platform?: string | null
          project_id?: string | null
          sort_order?: number
          thumbnail_url?: string | null
          title?: string | null
          unit_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_media_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_media_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_media_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_results: {
        Row: {
          availability_score: number | null
          budget_score: number | null
          configuration_score: number | null
          created_at: string
          id: string
          listing_id: string | null
          location_score: number | null
          preference_score: number | null
          project_id: string | null
          project_score: number | null
          rank: number
          reasons: Json
          recommendation_run_id: string
          semantic_score: number | null
          size_score: number | null
          total_score: number
          unit_id: string | null
        }
        Insert: {
          availability_score?: number | null
          budget_score?: number | null
          configuration_score?: number | null
          created_at?: string
          id?: string
          listing_id?: string | null
          location_score?: number | null
          preference_score?: number | null
          project_id?: string | null
          project_score?: number | null
          rank: number
          reasons?: Json
          recommendation_run_id: string
          semantic_score?: number | null
          size_score?: number | null
          total_score: number
          unit_id?: string | null
        }
        Update: {
          availability_score?: number | null
          budget_score?: number | null
          configuration_score?: number | null
          created_at?: string
          id?: string
          listing_id?: string | null
          location_score?: number | null
          preference_score?: number | null
          project_id?: string | null
          project_score?: number | null
          rank?: number
          reasons?: Json
          recommendation_run_id?: string
          semantic_score?: number | null
          size_score?: number | null
          total_score?: number
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_results_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_results_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_results_recommendation_run_id_fkey"
            columns: ["recommendation_run_id"]
            isOneToOne: false
            referencedRelation: "recommendation_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_results_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_runs: {
        Row: {
          algorithm_version: string
          candidate_count: number
          created_at: string
          id: string
          lead_id: string
          query_snapshot: Json
          requirement_id: string
          tenant_id: string
        }
        Insert: {
          algorithm_version?: string
          candidate_count?: number
          created_at?: string
          id?: string
          lead_id: string
          query_snapshot?: Json
          requirement_id: string
          tenant_id: string
        }
        Update: {
          algorithm_version?: string
          candidate_count?: number
          created_at?: string
          id?: string
          lead_id?: string
          query_snapshot?: Json
          requirement_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_runs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "recommendation_runs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_runs_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "recommendation_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_terms: {
        Row: {
          available_from: string | null
          bachelors_allowed: boolean | null
          company_lease_allowed: boolean | null
          created_at: string
          family_preferred: boolean | null
          furnishing: Database["public"]["Enums"]["crm_furnishing"] | null
          id: string
          lease_duration_months: number | null
          listing_id: string
          maintenance: number | null
          monthly_rent: number
          notice_period_days: number | null
          pets_allowed: boolean | null
          security_deposit: number | null
          tenant_preferences: Json
          updated_at: string
        }
        Insert: {
          available_from?: string | null
          bachelors_allowed?: boolean | null
          company_lease_allowed?: boolean | null
          created_at?: string
          family_preferred?: boolean | null
          furnishing?: Database["public"]["Enums"]["crm_furnishing"] | null
          id?: string
          lease_duration_months?: number | null
          listing_id: string
          maintenance?: number | null
          monthly_rent: number
          notice_period_days?: number | null
          pets_allowed?: boolean | null
          security_deposit?: number | null
          tenant_preferences?: Json
          updated_at?: string
        }
        Update: {
          available_from?: string | null
          bachelors_allowed?: boolean | null
          company_lease_allowed?: boolean | null
          created_at?: string
          family_preferred?: boolean | null
          furnishing?: Database["public"]["Enums"]["crm_furnishing"] | null
          id?: string
          lease_duration_months?: number | null
          listing_id?: string
          maintenance?: number | null
          monthly_rent?: number
          notice_period_days?: number | null
          pets_allowed?: boolean | null
          security_deposit?: number | null
          tenant_preferences?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_terms_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_locations: {
        Row: {
          created_at: string
          id: string
          is_must_have: boolean
          location_id: string
          max_distance_km: number | null
          preference_level: number
          requirement_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_must_have?: boolean
          location_id: string
          max_distance_km?: number | null
          preference_level?: number
          requirement_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_must_have?: boolean
          location_id?: string
          max_distance_km?: number | null
          preference_level?: number
          requirement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirement_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_locations_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements: {
        Row: {
          area_max_sqft: number | null
          area_min_sqft: number | null
          bathrooms_min: number | null
          bedrooms_max: number | null
          bedrooms_min: number | null
          budget_max: number | null
          budget_min: number | null
          created_at: string
          furnishing: Database["public"]["Enums"]["crm_furnishing"] | null
          id: string
          is_active: boolean
          lead_id: string
          notes: string | null
          parking_required: number | null
          possession_before: string | null
          preferred_facing: string | null
          preferred_floor_max: number | null
          preferred_floor_min: number | null
          purpose: Database["public"]["Enums"]["crm_purpose_type"] | null
          requirement_type: Database["public"]["Enums"]["crm_requirement_type"]
          updated_at: string
        }
        Insert: {
          area_max_sqft?: number | null
          area_min_sqft?: number | null
          bathrooms_min?: number | null
          bedrooms_max?: number | null
          bedrooms_min?: number | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          furnishing?: Database["public"]["Enums"]["crm_furnishing"] | null
          id?: string
          is_active?: boolean
          lead_id: string
          notes?: string | null
          parking_required?: number | null
          possession_before?: string | null
          preferred_facing?: string | null
          preferred_floor_max?: number | null
          preferred_floor_min?: number | null
          purpose?: Database["public"]["Enums"]["crm_purpose_type"] | null
          requirement_type: Database["public"]["Enums"]["crm_requirement_type"]
          updated_at?: string
        }
        Update: {
          area_max_sqft?: number | null
          area_min_sqft?: number | null
          bathrooms_min?: number | null
          bedrooms_max?: number | null
          bedrooms_min?: number | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          furnishing?: Database["public"]["Enums"]["crm_furnishing"] | null
          id?: string
          is_active?: boolean
          lead_id?: string
          notes?: string | null
          parking_required?: number | null
          possession_before?: string | null
          preferred_facing?: string | null
          preferred_floor_max?: number | null
          preferred_floor_min?: number | null
          purpose?: Database["public"]["Enums"]["crm_purpose_type"] | null
          requirement_type?: Database["public"]["Enums"]["crm_requirement_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirements_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "requirements_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_at: string | null
          id: string
          lead_id: string | null
          metadata: Json
          person_id: string | null
          priority: Database["public"]["Enums"]["crm_lead_priority"]
          scheduled_at: string
          source_activity_id: string | null
          status: Database["public"]["Enums"]["crm_task_status"]
          task_type: Database["public"]["Enums"]["crm_task_type"]
          tenant_id: string
          title: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json
          person_id?: string | null
          priority?: Database["public"]["Enums"]["crm_lead_priority"]
          scheduled_at: string
          source_activity_id?: string | null
          status?: Database["public"]["Enums"]["crm_task_status"]
          task_type: Database["public"]["Enums"]["crm_task_type"]
          tenant_id: string
          title: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json
          person_id?: string | null
          priority?: Database["public"]["Enums"]["crm_lead_priority"]
          scheduled_at?: string
          source_activity_id?: string | null
          status?: Database["public"]["Enums"]["crm_task_status"]
          task_type?: Database["public"]["Enums"]["crm_task_type"]
          tenant_id?: string
          title?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "tasks_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          tenant_code: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tenant_code: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      units: {
        Row: {
          asking_price: number | null
          balcony_area_sqft: number | null
          bathrooms: number | null
          bedrooms: number | null
          builtup_area_sqft: number | null
          carpet_area_sqft: number | null
          configuration_id: string | null
          created_at: string
          facing: string | null
          floor_number: number | null
          id: string
          metadata: Json
          owner_person_id: string | null
          parking_count: number | null
          phase_id: string | null
          price_per_sqft: number | null
          project_id: string
          status: Database["public"]["Enums"]["crm_unit_status"]
          super_builtup_area_sqft: number | null
          tower_id: string | null
          unit_number: string
          updated_at: string
        }
        Insert: {
          asking_price?: number | null
          balcony_area_sqft?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          builtup_area_sqft?: number | null
          carpet_area_sqft?: number | null
          configuration_id?: string | null
          created_at?: string
          facing?: string | null
          floor_number?: number | null
          id?: string
          metadata?: Json
          owner_person_id?: string | null
          parking_count?: number | null
          phase_id?: string | null
          price_per_sqft?: number | null
          project_id: string
          status?: Database["public"]["Enums"]["crm_unit_status"]
          super_builtup_area_sqft?: number | null
          tower_id?: string | null
          unit_number: string
          updated_at?: string
        }
        Update: {
          asking_price?: number | null
          balcony_area_sqft?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          builtup_area_sqft?: number | null
          carpet_area_sqft?: number | null
          configuration_id?: string | null
          created_at?: string
          facing?: string | null
          floor_number?: number | null
          id?: string
          metadata?: Json
          owner_person_id?: string | null
          parking_count?: number | null
          phase_id?: string | null
          price_per_sqft?: number | null
          project_id?: string
          status?: Database["public"]["Enums"]["crm_unit_status"]
          super_builtup_area_sqft?: number | null
          tower_id?: string | null
          unit_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "project_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_owner_person_id_fkey"
            columns: ["owner_person_id"]
            isOneToOne: false
            referencedRelation: "lead_dashboard"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "units_owner_person_id_fkey"
            columns: ["owner_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_tower_id_fkey"
            columns: ["tower_id"]
            isOneToOne: false
            referencedRelation: "project_towers"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          role: string
          tenant_code: string
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          phone?: string | null
          role?: string
          tenant_code: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: string
          tenant_code?: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_code_fkey"
            columns: ["tenant_code"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_code"]
          },
          {
            foreignKeyName: "users_tenant_code_fkey"
            columns: ["tenant_code"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_code"]
          },
          {
            foreignKeyName: "users_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
          tenant_code: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
          tenant_code?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          tenant_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_tenant_code_fkey"
            columns: ["tenant_code"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_code"]
          },
          {
            foreignKeyName: "workspaces_tenant_code_fkey"
            columns: ["tenant_code"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_code"]
          },
        ]
      }
    }
    Views: {
      agent_sales_performance: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          contacted_leads: number | null
          hot_leads: number | null
          leads: number | null
          lost_opportunities: number | null
          opportunities: number | null
          pipeline_value: number | null
          staged_leads: number | null
          tenant_id: string | null
          weighted_pipeline_value: number | null
          won_opportunities: number | null
          won_value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_user_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_pipeline: {
        Row: {
          assigned_user_id: string | null
          closed_at: string | null
          created_at: string | null
          deal_id: string | null
          deal_name: string | null
          deal_value: number | null
          display_order: number | null
          expected_close_date: string | null
          lead_id: string | null
          lost_reason: string | null
          notes: string | null
          owner_name: string | null
          owner_user_id: string | null
          person_name: string | null
          pipeline_id: string | null
          pipeline_name: string | null
          probability: number | null
          stage_id: string | null
          stage_name: string | null
          stage_probability: number | null
          stage_type: Database["public"]["Enums"]["deal_stage_type"] | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "lead_dashboard"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "sales_funnel_performance"
            referencedColumns: ["stage_id"]
          },
          {
            foreignKeyName: "deals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "deals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      lead_activity_timeline: {
        Row: {
          activity_id: string | null
          activity_type: string | null
          actor_name: string | null
          detail: string | null
          lead_id: string | null
          occurred_at: string | null
          title: string | null
        }
        Relationships: []
      }
      lead_dashboard: {
        Row: {
          assigned_user_id: string | null
          assigned_user_name: string | null
          call_count: number | null
          closed_at: string | null
          created_at: string | null
          email: string | null
          first_contact_at: string | null
          last_contact_at: string | null
          lead_id: string | null
          lead_score: number | null
          next_followup_at: string | null
          next_task_due_at: string | null
          person_id: string | null
          person_name: string | null
          phone: string | null
          pipeline_name: string | null
          priority: Database["public"]["Enums"]["crm_lead_priority"] | null
          stage_name: string | null
          temperature:
            | Database["public"]["Enums"]["crm_lead_temperature"]
            | null
          tenant_id: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_source_performance: {
        Row: {
          avg_lead_score: number | null
          closed_hot_leads: number | null
          leads: number | null
          open_leads: number | null
          platform: string | null
          source_id: string | null
          source_name: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_funnel_performance: {
        Row: {
          display_order: number | null
          opportunities: number | null
          stage_id: string | null
          stage_name: string | null
          stage_type: Database["public"]["Enums"]["deal_stage_type"] | null
          tenant_id: string | null
          value: number | null
          weighted_value: number | null
          win_probability: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      source_sales_performance: {
        Row: {
          hot_leads: number | null
          leads: number | null
          opportunities: number | null
          platform: string | null
          source_name: string | null
          staged_leads: number | null
          tenant_id: string | null
          won_opportunities: number | null
          won_value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_dashboard_metrics"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_dashboard_metrics: {
        Row: {
          active_listings: number | null
          active_projects: number | null
          available_units: number | null
          calls_last_24h: number | null
          hot_leads: number | null
          open_leads: number | null
          overdue_tasks: number | null
          tasks_next_24h: number | null
          tenant_code: string | null
          tenant_id: string | null
          tenant_name: string | null
          total_leads: number | null
        }
        Insert: {
          active_listings?: never
          active_projects?: never
          available_units?: never
          calls_last_24h?: never
          hot_leads?: never
          open_leads?: never
          overdue_tasks?: never
          tasks_next_24h?: never
          tenant_code?: string | null
          tenant_id?: string | null
          tenant_name?: string | null
          total_leads?: never
        }
        Update: {
          active_listings?: never
          active_projects?: never
          available_units?: never
          calls_last_24h?: never
          hot_leads?: never
          open_leads?: never
          overdue_tasks?: never
          tasks_next_24h?: never
          tenant_code?: string | null
          tenant_id?: string | null
          tenant_name?: string | null
          total_leads?: never
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      bulk_ingest_leads: {
        Args: { p_rows: Json; p_workspace_id?: string }
        Returns: Json
      }
      claim_next_dialer_item: {
        Args: { p_campaign_id: string; p_session_id: string }
        Returns: {
          attempt_count: number
          campaign_id: string
          claimed_at: string
          claimed_by: string
          id: string
          lead_id: string
          next_attempt_at: string
          person_id: string
          phone_id: string
          priority: number
          status: string
        }[]
      }
      crm_campaign_assignee_is_valid: {
        Args: {
          p_assigned_user_id: string
          p_tenant_id: string
          p_workspace_id: string
        }
        Returns: boolean
      }
      crm_can_manage_tenant: { Args: never; Returns: boolean }
      crm_current_tenant_id: { Args: never; Returns: string }
      crm_current_user_role: { Args: never; Returns: string }
      crm_normalize_email: { Args: { p_email: string }; Returns: string }
      crm_normalize_phone: { Args: { p_phone: string }; Returns: string }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      enroll_lead_followup: {
        Args: { p_lead_id: string; p_sequence_id?: string }
        Returns: string
      }
      ensure_default_followup_sequence: {
        Args: { p_tenant_id: string; p_workspace_id?: string }
        Returns: string
      }
      ensure_lead_deal: {
        Args: { p_deal_name?: string; p_lead_id: string }
        Returns: string
      }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      find_inbound_callback: {
        Args: { p_normalized_phone: string }
        Returns: {
          assigned_user_id: string
          campaign_id: string
          campaign_name: string
          last_attempt_at: string
          last_call_id: string
          lead_id: string
          person_id: string
        }[]
      }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_nearest_projects: {
        Args: {
          p_latitude: number
          p_limit?: number
          p_longitude: number
          p_radius_km?: number
        }
        Returns: {
          city: string
          developer_name: string
          distance_km: number
          latitude: number
          location_name: string
          longitude: number
          price_max: number
          price_min: number
          project_id: string
          project_name: string
          status: string
        }[]
      }
      get_property_recommendations: {
        Args: { p_lead_id: string; p_limit?: number }
        Returns: {
          area_sqft: number
          bathrooms: number
          bedrooms: number
          developer_name: string
          facing: string
          floor_number: number
          listing_id: string
          location_name: string
          price: number
          project_id: string
          project_name: string
          rank: number
          reasons: Json
          recommendation_run_id: string
          total_score: number
          unit_id: string
          unit_number: string
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      ingest_lead: {
        Args: {
          p_bedrooms_max?: number
          p_bedrooms_min?: number
          p_budget_max?: number
          p_budget_min?: number
          p_email?: string
          p_external_ad_id?: string
          p_external_campaign_id?: string
          p_external_form_id?: string
          p_external_lead_id?: string
          p_first_name?: string
          p_last_name?: string
          p_notes?: string
          p_phone?: string
          p_preferred_location?: string
          p_source_name?: string
          p_workspace_id?: string
        }
        Returns: {
          assigned_user_id: string
          is_existing_person: boolean
          lead_id: string
          owner_preserved: boolean
          person_id: string
        }[]
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      process_all_due_followups: { Args: { p_limit?: number }; Returns: number }
      process_due_followups: { Args: { p_limit?: number }; Returns: number }
      reassign_lead: {
        Args: {
          p_lead_id: string
          p_new_assigned_user_id: string
          p_reason?: string
        }
        Returns: string
      }
      resolve_project_location: {
        Args: {
          p_city?: string
          p_country?: string
          p_latitude?: number
          p_location_name?: string
          p_longitude?: number
          p_state?: string
        }
        Returns: string
      }
      run_property_recommendations: {
        Args: { p_lead_id: string; p_limit?: number }
        Returns: string
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unaccent: { Args: { "": string }; Returns: string }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      allocation_strategy: "round_robin" | "equal_distribution" | "on_demand"
      crm_call_outcome:
        | "connected"
        | "not_connected"
        | "busy"
        | "no_answer"
        | "wrong_number"
        | "voicemail"
        | "callback_requested"
      crm_furnishing: "unfurnished" | "semi_furnished" | "fully_furnished"
      crm_lead_priority: "low" | "normal" | "high" | "urgent"
      crm_lead_temperature: "cold" | "warm" | "hot"
      crm_listing_status:
        | "draft"
        | "active"
        | "reserved"
        | "under_offer"
        | "closed"
        | "expired"
        | "withdrawn"
      crm_listing_type: "primary_sale" | "resale" | "rent" | "lease"
      crm_location_type:
        | "country"
        | "state"
        | "city"
        | "zone"
        | "locality"
        | "sub_locality"
        | "micro_market"
        | "landmark"
      crm_media_type:
        | "photo"
        | "video"
        | "floor_plan"
        | "brochure"
        | "price_sheet"
        | "master_plan"
        | "home_tour"
        | "location_map"
        | "document"
      crm_person_status: "active" | "inactive" | "do_not_contact" | "merged"
      crm_processing_status:
        | "received"
        | "processing"
        | "processed"
        | "duplicate"
        | "failed"
        | "ignored"
      crm_project_status:
        | "upcoming"
        | "pre_launch"
        | "launched"
        | "under_construction"
        | "ready_to_move"
        | "completed"
        | "sold_out"
        | "inactive"
      crm_property_category: "primary_sale" | "resale" | "rental"
      crm_property_interaction:
        | "viewed"
        | "shared"
        | "clicked"
        | "interested"
        | "shortlisted"
        | "rejected"
        | "visited"
        | "enquired"
        | "offered"
        | "purchased"
      crm_property_type:
        | "apartment"
        | "villa"
        | "plot"
        | "independent_house"
        | "row_house"
        | "commercial"
        | "office"
        | "retail"
        | "other"
      crm_purpose_type: "end_use" | "investment" | "rental_income" | "resale"
      crm_requirement_type: "buy" | "rent" | "resale" | "lease"
      crm_task_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "skipped"
      crm_task_type:
        | "call"
        | "followup"
        | "callback"
        | "send_properties"
        | "confirm_viewing"
        | "viewing_followup"
        | "send_documents"
        | "negotiation"
        | "custom"
      crm_unit_status:
        | "available"
        | "reserved"
        | "sold"
        | "leased"
        | "under_maintenance"
        | "off_market"
      deal_stage_type:
        | "qualification"
        | "viewing"
        | "offer_made"
        | "under_contract"
        | "closed_won"
        | "closed_lost"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      allocation_strategy: ["round_robin", "equal_distribution", "on_demand"],
      crm_call_outcome: [
        "connected",
        "not_connected",
        "busy",
        "no_answer",
        "wrong_number",
        "voicemail",
        "callback_requested",
      ],
      crm_furnishing: ["unfurnished", "semi_furnished", "fully_furnished"],
      crm_lead_priority: ["low", "normal", "high", "urgent"],
      crm_lead_temperature: ["cold", "warm", "hot"],
      crm_listing_status: [
        "draft",
        "active",
        "reserved",
        "under_offer",
        "closed",
        "expired",
        "withdrawn",
      ],
      crm_listing_type: ["primary_sale", "resale", "rent", "lease"],
      crm_location_type: [
        "country",
        "state",
        "city",
        "zone",
        "locality",
        "sub_locality",
        "micro_market",
        "landmark",
      ],
      crm_media_type: [
        "photo",
        "video",
        "floor_plan",
        "brochure",
        "price_sheet",
        "master_plan",
        "home_tour",
        "location_map",
        "document",
      ],
      crm_person_status: ["active", "inactive", "do_not_contact", "merged"],
      crm_processing_status: [
        "received",
        "processing",
        "processed",
        "duplicate",
        "failed",
        "ignored",
      ],
      crm_project_status: [
        "upcoming",
        "pre_launch",
        "launched",
        "under_construction",
        "ready_to_move",
        "completed",
        "sold_out",
        "inactive",
      ],
      crm_property_category: ["primary_sale", "resale", "rental"],
      crm_property_interaction: [
        "viewed",
        "shared",
        "clicked",
        "interested",
        "shortlisted",
        "rejected",
        "visited",
        "enquired",
        "offered",
        "purchased",
      ],
      crm_property_type: [
        "apartment",
        "villa",
        "plot",
        "independent_house",
        "row_house",
        "commercial",
        "office",
        "retail",
        "other",
      ],
      crm_purpose_type: ["end_use", "investment", "rental_income", "resale"],
      crm_requirement_type: ["buy", "rent", "resale", "lease"],
      crm_task_status: [
        "pending",
        "in_progress",
        "completed",
        "cancelled",
        "skipped",
      ],
      crm_task_type: [
        "call",
        "followup",
        "callback",
        "send_properties",
        "confirm_viewing",
        "viewing_followup",
        "send_documents",
        "negotiation",
        "custom",
      ],
      crm_unit_status: [
        "available",
        "reserved",
        "sold",
        "leased",
        "under_maintenance",
        "off_market",
      ],
      deal_stage_type: [
        "qualification",
        "viewing",
        "offer_made",
        "under_contract",
        "closed_won",
        "closed_lost",
      ],
    },
  },
} as const
