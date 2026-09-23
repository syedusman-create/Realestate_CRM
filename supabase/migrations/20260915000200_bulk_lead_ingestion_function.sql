CREATE OR REPLACE FUNCTION public.bulk_ingest_leads(p_rows jsonb,p_workspace_id uuid DEFAULT NULL::uuid)
RETURNS jsonb LANGUAGE plpgsql SET search_path TO 'public','pg_temp'
AS $function$
DECLARE v_row jsonb; v_index integer:=0; v_results jsonb:='[]'::jsonb; v_ingested record;
BEGIN
  IF p_rows IS NULL OR jsonb_typeof(p_rows)<>'array' THEN RAISE EXCEPTION 'p_rows must be a JSON array'; END IF;
  IF jsonb_array_length(p_rows)>5000 THEN RAISE EXCEPTION 'Maximum 5000 leads per batch'; END IF;
  IF NOT COALESCE(public.crm_can_manage_tenant(),false) THEN RAISE EXCEPTION 'Only tenant managers can bulk import leads'; END IF;
  FOR v_row IN SELECT value FROM jsonb_array_elements(p_rows) LOOP
    v_index:=v_index+1;
    BEGIN
      SELECT * INTO v_ingested FROM public.ingest_lead(
        p_workspace_id,NULLIF(trim(COALESCE(v_row->>'first_name','')),''),NULLIF(trim(COALESCE(v_row->>'last_name','')),''),
        NULLIF(trim(COALESCE(v_row->>'phone','')),''),NULLIF(trim(COALESCE(v_row->>'email','')),''),
        COALESCE(NULLIF(trim(v_row->>'source_name'),''),'csv_import'),NULLIF(trim(v_row->>'external_lead_id'),''),
        NULLIF(trim(v_row->>'external_campaign_id'),''),NULLIF(trim(v_row->>'external_ad_id'),''),NULLIF(trim(v_row->>'external_form_id'),''),
        CASE WHEN NULLIF(trim(v_row->>'budget_min'),'') IS NULL THEN NULL ELSE (v_row->>'budget_min')::numeric END,
        CASE WHEN NULLIF(trim(v_row->>'budget_max'),'') IS NULL THEN NULL ELSE (v_row->>'budget_max')::numeric END,
        CASE WHEN NULLIF(trim(v_row->>'bedrooms_min'),'') IS NULL THEN NULL ELSE (v_row->>'bedrooms_min')::integer END,
        CASE WHEN NULLIF(trim(v_row->>'bedrooms_max'),'') IS NULL THEN NULL ELSE (v_row->>'bedrooms_max')::integer END,
        NULLIF(trim(v_row->>'preferred_location'),''),NULLIF(trim(v_row->>'notes'),'')
      );
      v_results:=v_results||jsonb_build_array(jsonb_build_object('row',v_index,'ok',true,'lead_id',v_ingested.lead_id,'person_id',v_ingested.person_id,'assigned_user_id',v_ingested.assigned_user_id,'is_existing_person',v_ingested.is_existing_person,'owner_preserved',v_ingested.owner_preserved));
    EXCEPTION WHEN OTHERS THEN
      v_results:=v_results||jsonb_build_array(jsonb_build_object('row',v_index,'ok',false,'error',SQLERRM));
    END;
  END LOOP;
  RETURN v_results;
END;
$function$;
REVOKE ALL ON FUNCTION public.bulk_ingest_leads(jsonb,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bulk_ingest_leads(jsonb,uuid) TO authenticated;
