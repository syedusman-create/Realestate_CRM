create or replace function public.enroll_lead_followup(p_lead_id uuid, p_sequence_id uuid default null)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_lead public.leads%rowtype;
  v_sequence_id uuid;
  v_enrollment_id uuid;
  v_first_delay integer;
  v_first_run timestamptz;
begin
  select * into v_lead from public.leads where id = p_lead_id and tenant_id = (select public.crm_current_tenant_id());
  if not found then raise exception 'Lead not found or forbidden'; end if;
  if p_sequence_id is null then
    v_sequence_id := public.ensure_default_followup_sequence(v_lead.tenant_id, v_lead.workspace_id);
  else
    select id into v_sequence_id from public.followup_sequences where id = p_sequence_id and tenant_id = v_lead.tenant_id and is_active = true;
    if v_sequence_id is null then raise exception 'Follow-up sequence not found or inactive'; end if;
  end if;
  select delay_minutes into v_first_delay from public.followup_sequence_steps where sequence_id = v_sequence_id and is_active = true order by step_order limit 1;
  v_first_run := now() + make_interval(mins => coalesce(v_first_delay, 0));
  insert into public.lead_followup_enrollments(tenant_id, lead_id, sequence_id, current_step, next_run_at)
  values(v_lead.tenant_id, p_lead_id, v_sequence_id, 0, v_first_run)
  on conflict(lead_id, sequence_id) do update set status='active', next_run_at=excluded.next_run_at, completed_at=null, updated_at=now()
  returning id into v_enrollment_id;
  update public.leads set next_followup_at=v_first_run, updated_at=now() where id=v_lead.id;
  return v_enrollment_id;
end;
$$;

grant execute on function public.enroll_lead_followup(uuid, uuid) to authenticated;

create or replace function public.process_all_due_followups(p_limit integer default 200)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  r record; v_step record; v_next_delay integer; v_next_run timestamptz; v_count integer := 0; v_limit integer := least(greatest(coalesce(p_limit,200),1),1000);
begin
  for r in
    select e.*, l.assigned_user_id, l.person_id, l.workspace_id
    from public.lead_followup_enrollments e
    join public.leads l on l.id=e.lead_id
    join public.followup_sequences fs on fs.id=e.sequence_id
    where e.status='active' and fs.is_active=true and e.next_run_at is not null and e.next_run_at<=now()
    order by e.next_run_at limit v_limit for update of e skip locked
  loop
    select * into v_step from public.followup_sequence_steps s where s.sequence_id=r.sequence_id and s.is_active=true and s.step_order=r.current_step+1 limit 1;
    if not found then
      update public.lead_followup_enrollments set status='completed',completed_at=now(),next_run_at=null,updated_at=now() where id=r.id;
      update public.leads set next_followup_at=null,updated_at=now() where id=r.lead_id;
      continue;
    end if;
    insert into public.tasks(tenant_id,workspace_id,assigned_to,lead_id,person_id,task_type,title,description,priority,scheduled_at,due_at,status,metadata)
    values(r.tenant_id,r.workspace_id,r.assigned_user_id,r.lead_id,r.person_id,v_step.task_type,v_step.title,v_step.description,v_step.priority,now(),now()+interval '1 day','pending',jsonb_build_object('source','followup_automation','sequence_id',r.sequence_id,'sequence_step',v_step.step_order));
    select delay_minutes into v_next_delay from public.followup_sequence_steps where sequence_id=r.sequence_id and step_order=v_step.step_order+1 and is_active=true;
    v_next_run := case when v_next_delay is null then null else now()+make_interval(mins=>v_next_delay) end;
    update public.lead_followup_enrollments set current_step=v_step.step_order,next_run_at=v_next_run,status=case when v_next_run is null then 'completed' else 'active' end,completed_at=case when v_next_run is null then now() else null end,updated_at=now() where id=r.id;
    update public.leads set next_followup_at=v_next_run,updated_at=now() where id=r.lead_id;
    v_count:=v_count+1;
  end loop;
  return v_count;
end;
$$;

revoke all on function public.process_all_due_followups(integer) from public, anon, authenticated;
grant execute on function public.process_all_due_followups(integer) to service_role;

create index if not exists idx_followup_enrollments_due on public.lead_followup_enrollments(status,next_run_at) where status='active' and next_run_at is not null;
