-- Manager-only writes for project configuration and unit inventory.
-- Read access remains available to authenticated CRM users.

create policy configurations_manager_insert
  on public.project_configurations
  for insert to authenticated
  with check (
    public.crm_can_manage_tenant()
    and exists (
      select 1
      from public.projects p
      where p.id = project_configurations.project_id
    )
  );

create policy configurations_manager_update
  on public.project_configurations
  for update to authenticated
  using (public.crm_can_manage_tenant())
  with check (public.crm_can_manage_tenant());

create policy configurations_manager_delete
  on public.project_configurations
  for delete to authenticated
  using (public.crm_can_manage_tenant());

create policy units_manager_insert
  on public.units
  for insert to authenticated
  with check (public.crm_can_manage_tenant());

create policy units_manager_update
  on public.units
  for update to authenticated
  using (public.crm_can_manage_tenant())
  with check (public.crm_can_manage_tenant());

create policy units_manager_delete
  on public.units
  for delete to authenticated
  using (public.crm_can_manage_tenant());

create index if not exists project_configurations_project_id_bedrooms_idx
  on public.project_configurations (project_id, bedrooms);

create index if not exists units_project_id_status_price_idx
  on public.units (project_id, status, asking_price);
