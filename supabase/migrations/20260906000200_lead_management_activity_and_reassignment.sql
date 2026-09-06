create or replace function public.reassign_lead(
  p_lead_id uuid,
  p_new_assigned_user_id uuid,
  p_reason text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_lead public.leads%rowtype;
  v_target public.users%rowtype;
  v_actor uuid := (select auth.uid());
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  if not (select public.crm_can_manage_tenant()) then raise exception 'Only managers can reassign leads'; end if;
  if p_lead_id is null or p_new_assigned_user_id is null then raise exception 'Lead and target user are required'; end if;
  select * into v_lead from public.leads where id = p_lead_id and tenant_id = (select public.crm_current_tenant_id()) for update;
  if not found then raise exception 'Lead not found'; end if;
  select * into v_target from public.users where id = p_new_assigned_user_id and tenant_code = (select tenant_code from public.users where id = v_actor) and is_active = true;
  if not found then raise exception 'Target agent is not an active member of this tenant'; end if;
  if v_lead.assigned_user_id = p_new_assigned_user_id then return v_lead.id; end if;
  update public.lead_assignments set ended_at = now(), reason = coalesce(p_reason, 'Reassigned') where lead_id = v_lead.id and ended_at is null;
  update public.leads set assigned_user_id = p_new_assigned_user_id, updated_at = now() where id = v_lead.id;
  insert into public.lead_assignments (lead_id, assigned_to, assigned_by, assignment_type, started_at, reason) values (v_lead.id, p_new_assigned_user_id, v_actor, 'manual', now(), coalesce(p_reason, 'Reassigned'));
  return v_lead.id;
end;
$$;
grant execute on function public.reassign_lead(uuid, uuid, text) to authenticated;

create or replace view public.lead_activity_timeline with (security_invoker = true) as
select c.lead_id, c.id as activity_id, 'call'::text as activity_type, c.started_at as occurred_at, case when c.direction = 'outbound' then 'Outbound call' else 'Inbound call' end as title, concat_ws(' · ', replace(c.outcome::text, '_', ' '), nullif(c.disposition, ''), nullif(c.sub_disposition, ''), nullif(c.notes, '')) as detail, u.full_name as actor_name from public.calls c left join public.users u on u.id = c.agent_id
union all
select t.lead_id, t.id, 'task'::text, coalesce(t.completed_at, t.due_at, t.scheduled_at), t.title, concat_ws(' · ', t.task_type::text, t.status::text, nullif(t.description, '')), u.full_name from public.tasks t left join public.users u on u.id = t.assigned_to where t.lead_id is not null
union all
select s.lead_id, s.id, 'property_share'::text, s.created_at, 'Property share'::text, concat_ws(' · ', s.channel, left(s.message_body, 180)), u.full_name from public.communication_shares s left join public.users u on u.id = s.agent_id where s.lead_id is not null
union all
select pi.lead_id, pi.id, 'property_interaction'::text, pi.created_at, initcap(replace(pi.interaction_type::text, '_', ' ')), concat_ws(' · ', pi.source, nullif(pi.notes, '')), u.full_name from public.property_interactions pi left join public.users u on u.id = pi.agent_id where pi.lead_id is not null
union all
select h.lead_id, h.id, 'status_change'::text, h.created_at, 'Lead status changed'::text, concat_ws(' → ', coalesce(ps_from.name, 'New'), coalesce(ps_to.name, 'New')), u.full_name from public.lead_status_history h left join public.pipeline_stages ps_from on ps_from.id = h.from_status_id left join public.pipeline_stages ps_to on ps_to.id = h.to_status_id left join public.users u on u.id = h.changed_by
union all
select a.lead_id, a.id, 'assignment_change'::text, a.started_at, 'Lead assigned'::text, concat_ws(' · ', 'Assigned to ' || target.full_name, nullif(a.reason, '')), assigner.full_name from public.lead_assignments a left join public.users target on target.id = a.assigned_to left join public.users assigner on assigner.id = a.assigned_by;
grant select on public.lead_activity_timeline to authenticated;
revoke all on public.lead_activity_timeline from anon;
create index if not exists idx_lead_assignments_lead_started_at on public.lead_assignments (lead_id, started_at desc);
create index if not exists idx_lead_status_history_lead_created_at on public.lead_status_history (lead_id, created_at desc);
create index if not exists idx_calls_lead_started_at on public.calls (lead_id, started_at desc);
create index if not exists idx_tasks_lead_scheduled_at on public.tasks (lead_id, scheduled_at desc) where lead_id is not null;
create index if not exists idx_property_interactions_lead_created_at on public.property_interactions (lead_id, created_at desc) where lead_id is not null;
create index if not exists idx_communication_shares_lead_created_at on public.communication_shares (lead_id, created_at desc) where lead_id is not null;