-- Canonical mobile dialer layer.
-- This migration is additive: the existing public.calls table remains the CRM call record.
-- Dialer events provide device/telephony telemetry and queue/session linkage.
-- NOTE: this file mirrors the migration already applied to the connected Supabase project.

create table if not exists public.dialer_campaigns (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  workspace_id uuid references public.workspaces(id),
  name text not null,
  description text,
  status text not null default 'draft' check (status in ('draft','running','paused','completed','archived')),
  dialing_mode text not null default 'assisted' check (dialing_mode in ('assisted','automatic')),
  max_attempts integer not null default 3 check (max_attempts between 1 and 20),
  retry_after_minutes integer not null default 60 check (retry_after_minutes between 1 and 43200),
  allow_callbacks boolean not null default true,
  allow_voicemail boolean not null default true,
  quiet_hours jsonb not null default '{"enabled":true,"start":"20:00","end":"09:00"}'::jsonb,
  compliance_config jsonb not null default '{}'::jsonb,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dialer_campaign_leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  campaign_id uuid not null references public.dialer_campaigns(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  phone_id uuid not null references public.person_phones(id) on delete restrict,
  status text not null default 'queued' check (status in ('queued','dialing','connected','no_answer','busy','wrong_number','voicemail','callback','completed','skipped','dnc','failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  priority integer not null default 0,
  next_attempt_at timestamptz,
  last_attempt_at timestamptz,
  claimed_by uuid references public.users(id),
  claimed_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, lead_id, phone_id)
);

create table if not exists public.dialer_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  workspace_id uuid references public.workspaces(id),
  campaign_id uuid not null references public.dialer_campaigns(id) on delete cascade,
  agent_id uuid not null references public.users(id),
  status text not null default 'running' check (status in ('running','paused','stopped')),
  device_id text,
  current_queue_item_id uuid references public.dialer_campaign_leads(id),
  started_at timestamptz not null default now(),
  paused_at timestamptz,
  stopped_at timestamptz,
  last_heartbeat_at timestamptz not null default now(),
  stats jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dialer_call_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  session_id uuid references public.dialer_sessions(id) on delete set null,
  queue_item_id uuid references public.dialer_campaign_leads(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  person_id uuid references public.people(id) on delete set null,
  call_id uuid references public.calls(id) on delete set null,
  agent_id uuid references public.users(id),
  direction text not null check (direction in ('inbound','outbound')),
  event_type text not null check (event_type in ('initiated','ringing','connected','ended','missed','failed','rejected','no_answer','callback_detected')),
  event_at timestamptz not null default now(),
  normalized_phone text,
  source text not null default 'mobile',
  external_event_id text,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_dialer_campaigns_tenant_status on public.dialer_campaigns (tenant_id, status);
create index if not exists idx_dialer_campaign_leads_campaign_queue on public.dialer_campaign_leads (campaign_id, status, next_attempt_at, priority desc, created_at);
create index if not exists idx_dialer_campaign_leads_lead on public.dialer_campaign_leads (tenant_id, lead_id);
create index if not exists idx_dialer_campaign_leads_phone on public.dialer_campaign_leads (tenant_id, phone_id);
create index if not exists idx_dialer_sessions_agent_status on public.dialer_sessions (tenant_id, agent_id, status);
create index if not exists idx_dialer_call_events_phone_time on public.dialer_call_events (tenant_id, normalized_phone, event_at desc);
create index if not exists idx_dialer_call_events_session_time on public.dialer_call_events (session_id, event_at desc);
create unique index if not exists uq_dialer_call_events_external on public.dialer_call_events (tenant_id, source, external_event_id) where external_event_id is not null;

alter table public.dialer_campaigns enable row level security;
alter table public.dialer_campaign_leads enable row level security;
alter table public.dialer_sessions enable row level security;
alter table public.dialer_call_events enable row level security;

create policy dialer_campaigns_select on public.dialer_campaigns for select to authenticated using (
  tenant_id = (select public.crm_current_tenant_id())
  and ((select public.crm_can_manage_tenant()) or created_by = (select auth.uid())
       or exists (select 1 from public.dialer_campaign_leads dcl join public.leads l on l.id=dcl.lead_id where dcl.campaign_id=dialer_campaigns.id and l.assigned_user_id=(select auth.uid())))
);
create policy dialer_campaigns_insert on public.dialer_campaigns for insert to authenticated with check (
  tenant_id = (select public.crm_current_tenant_id()) and (select public.crm_can_manage_tenant())
);
create policy dialer_campaigns_update on public.dialer_campaigns for update to authenticated using (
  tenant_id = (select public.crm_current_tenant_id()) and (select public.crm_can_manage_tenant())
) with check (
  tenant_id = (select public.crm_current_tenant_id()) and (select public.crm_can_manage_tenant())
);
create policy dialer_campaigns_delete on public.dialer_campaigns for delete to authenticated using (
  tenant_id = (select public.crm_current_tenant_id()) and (select public.crm_can_manage_tenant())
);

create policy dialer_campaign_leads_select on public.dialer_campaign_leads for select to authenticated using (
  tenant_id = (select public.crm_current_tenant_id())
  and ((select public.crm_can_manage_tenant()) or exists (select 1 from public.leads l where l.id=dialer_campaign_leads.lead_id and l.assigned_user_id=(select auth.uid())) or claimed_by=(select auth.uid()))
);
create policy dialer_campaign_leads_insert on public.dialer_campaign_leads for insert to authenticated with check (
  tenant_id = (select public.crm_current_tenant_id()) and (select public.crm_can_manage_tenant())
);
create policy dialer_campaign_leads_update on public.dialer_campaign_leads for update to authenticated using (
  tenant_id = (select public.crm_current_tenant_id())
  and ((select public.crm_can_manage_tenant()) or claimed_by=(select auth.uid()) or exists (select 1 from public.leads l where l.id=dialer_campaign_leads.lead_id and l.assigned_user_id=(select auth.uid())))
) with check (
  tenant_id = (select public.crm_current_tenant_id())
  and ((select public.crm_can_manage_tenant()) or claimed_by=(select auth.uid()) or exists (select 1 from public.leads l where l.id=dialer_campaign_leads.lead_id and l.assigned_user_id=(select auth.uid())))
);
create policy dialer_campaign_leads_delete on public.dialer_campaign_leads for delete to authenticated using (
  tenant_id = (select public.crm_current_tenant_id()) and (select public.crm_can_manage_tenant())
);

create policy dialer_sessions_select on public.dialer_sessions for select to authenticated using (
  tenant_id = (select public.crm_current_tenant_id()) and ((select public.crm_can_manage_tenant()) or agent_id=(select auth.uid()))
);
create policy dialer_sessions_insert on public.dialer_sessions for insert to authenticated with check (
  tenant_id = (select public.crm_current_tenant_id()) and agent_id=(select auth.uid())
);
create policy dialer_sessions_update on public.dialer_sessions for update to authenticated using (
  tenant_id = (select public.crm_current_tenant_id()) and ((select public.crm_can_manage_tenant()) or agent_id=(select auth.uid()))
) with check (
  tenant_id = (select public.crm_current_tenant_id()) and ((select public.crm_can_manage_tenant()) or agent_id=(select auth.uid()))
);
create policy dialer_sessions_delete on public.dialer_sessions for delete to authenticated using (
  tenant_id = (select public.crm_current_tenant_id()) and ((select public.crm_can_manage_tenant()) or agent_id=(select auth.uid()))
);

create policy dialer_call_events_select on public.dialer_call_events for select to authenticated using (
  tenant_id = (select public.crm_current_tenant_id())
  and ((select public.crm_can_manage_tenant()) or agent_id=(select auth.uid()) or exists (select 1 from public.leads l where l.id=dialer_call_events.lead_id and l.assigned_user_id=(select auth.uid())))
);
create policy dialer_call_events_insert on public.dialer_call_events for insert to authenticated with check (
  tenant_id = (select public.crm_current_tenant_id()) and (agent_id is null or agent_id=(select auth.uid()) or (select public.crm_can_manage_tenant()))
);

create or replace function public.claim_next_dialer_item(p_campaign_id uuid, p_session_id uuid)
returns table (id uuid, campaign_id uuid, lead_id uuid, person_id uuid, phone_id uuid, status text, attempt_count integer, next_attempt_at timestamptz, claimed_by uuid, claimed_at timestamptz, priority integer)
language plpgsql
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_item public.dialer_campaign_leads;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  update public.dialer_sessions set status='running', current_queue_item_id=null, last_heartbeat_at=now(), updated_at=now()
  where id=p_session_id and campaign_id=p_campaign_id and tenant_id=public.crm_current_tenant_id() and agent_id=v_uid;
  select dcl.* into v_item
  from public.dialer_campaign_leads dcl
  join public.dialer_campaigns dc on dc.id=dcl.campaign_id
  where dcl.campaign_id=p_campaign_id
    and dcl.tenant_id=public.crm_current_tenant_id()
    and dc.status='running'
    and dcl.status in ('queued','no_answer','busy','failed')
    and dcl.attempt_count < dc.max_attempts
    and (dcl.next_attempt_at is null or dcl.next_attempt_at <= now())
    and (dcl.claimed_by is null or dcl.claimed_at < now() - interval '5 minutes')
    and (public.crm_can_manage_tenant() or exists (select 1 from public.leads l where l.id=dcl.lead_id and l.assigned_user_id=v_uid))
    and not exists (select 1 from public.people p where p.id=dcl.person_id and p.status='do_not_contact')
  order by dcl.priority desc, coalesce(dcl.next_attempt_at, '-infinity'::timestamptz), dcl.created_at
  for update skip locked limit 1;
  if v_item.id is null then return; end if;
  update public.dialer_campaign_leads set status='dialing', claimed_by=v_uid, claimed_at=now(), attempt_count=attempt_count+1, last_attempt_at=now(), updated_at=now()
  where public.dialer_campaign_leads.id=v_item.id returning * into v_item;
  update public.dialer_sessions set current_queue_item_id=v_item.id, last_heartbeat_at=now(), updated_at=now() where id=p_session_id and agent_id=v_uid;
  return query select v_item.id, v_item.campaign_id, v_item.lead_id, v_item.person_id, v_item.phone_id, v_item.status, v_item.attempt_count, v_item.next_attempt_at, v_item.claimed_by, v_item.claimed_at, v_item.priority;
end;
$$;

grant execute on function public.claim_next_dialer_item(uuid, uuid) to authenticated;

create or replace function public.find_inbound_callback(p_normalized_phone text)
returns table (person_id uuid, lead_id uuid, assigned_user_id uuid, campaign_id uuid, campaign_name text, last_attempt_at timestamptz, last_call_id uuid)
language sql
set search_path = ''
as $$
  select p.id, l.id, l.assigned_user_id, dcl.campaign_id, dc.name, dcl.last_attempt_at, dce.call_id
  from public.person_phones pp
  join public.people p on p.id=pp.person_id
  join public.leads l on l.person_id=p.id
  left join lateral (select x.* from public.dialer_campaign_leads x where x.lead_id=l.id and x.tenant_id=public.crm_current_tenant_id() order by x.last_attempt_at desc nulls last, x.updated_at desc limit 1) dcl on true
  left join public.dialer_campaigns dc on dc.id=dcl.campaign_id
  left join lateral (select ce.call_id from public.dialer_call_events ce where ce.lead_id=l.id and ce.normalized_phone=p_normalized_phone and ce.direction='outbound' order by ce.event_at desc limit 1) dce on true
  where pp.normalized_phone=p_normalized_phone
    and p.tenant_id=public.crm_current_tenant_id()
    and p.status <> 'do_not_contact'
    and (public.crm_can_manage_tenant() or l.assigned_user_id=auth.uid())
  order by dcl.last_attempt_at desc nulls last, l.updated_at desc
  limit 1;
$$;

grant execute on function public.find_inbound_callback(text) to authenticated;

create or replace function public.crm_set_dialer_updated_at()
returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists trg_dialer_campaigns_updated_at on public.dialer_campaigns;
create trigger trg_dialer_campaigns_updated_at before update on public.dialer_campaigns for each row execute function public.crm_set_dialer_updated_at();
drop trigger if exists trg_dialer_campaign_leads_updated_at on public.dialer_campaign_leads;
create trigger trg_dialer_campaign_leads_updated_at before update on public.dialer_campaign_leads for each row execute function public.crm_set_dialer_updated_at();
drop trigger if exists trg_dialer_sessions_updated_at on public.dialer_sessions;
create trigger trg_dialer_sessions_updated_at before update on public.dialer_sessions for each row execute function public.crm_set_dialer_updated_at();
