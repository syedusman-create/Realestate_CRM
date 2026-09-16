CREATE OR REPLACE FUNCTION public.resolve_project_location(
  p_location_name text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_latitude double precision DEFAULT NULL,
  p_longitude double precision DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $function$
DECLARE
  v_location_id uuid;
  v_city_id uuid;
  v_name text := NULLIF(trim(p_location_name), '');
  v_city text := NULLIF(trim(p_city), '');
  v_state text := NULLIF(trim(p_state), '');
  v_country text := NULLIF(trim(p_country), '');
  v_slug text;
BEGIN
  IF NOT COALESCE(public.crm_can_manage_tenant(), false) THEN RAISE EXCEPTION 'Manager access required'; END IF;
  IF v_name IS NULL AND v_city IS NULL THEN RETURN NULL; END IF;
  IF p_latitude IS NOT NULL AND p_longitude IS NOT NULL AND p_latitude BETWEEN -90 AND 90 AND p_longitude BETWEEN -180 AND 180 THEN
    SELECT l.id INTO v_location_id FROM public.locations l
    WHERE l.latitude IS NOT NULL AND l.longitude IS NOT NULL AND (v_city IS NULL OR lower(l.city)=lower(v_city))
      AND ST_DWithin(ST_SetSRID(ST_MakePoint(l.longitude,l.latitude),4326)::geography,ST_SetSRID(ST_MakePoint(p_longitude,p_latitude),4326)::geography,3000)
    ORDER BY ST_Distance(ST_SetSRID(ST_MakePoint(l.longitude,l.latitude),4326)::geography,ST_SetSRID(ST_MakePoint(p_longitude,p_latitude),4326)::geography) LIMIT 1;
    IF v_location_id IS NOT NULL THEN RETURN v_location_id; END IF;
  END IF;
  IF v_name IS NOT NULL THEN
    SELECT l.id INTO v_location_id FROM public.locations l WHERE lower(l.name)=lower(v_name) AND (v_city IS NULL OR lower(l.city)=lower(v_city)) ORDER BY CASE WHEN l.location_type IN ('locality','sub_locality','micro_market') THEN 0 ELSE 1 END LIMIT 1;
    IF v_location_id IS NOT NULL THEN RETURN v_location_id; END IF;
    SELECT l.id INTO v_location_id FROM public.locations l WHERE lower(v_name)=ANY(SELECT lower(value) FROM unnest(l.aliases) AS value) AND (v_city IS NULL OR lower(l.city)=lower(v_city)) LIMIT 1;
    IF v_location_id IS NOT NULL THEN RETURN v_location_id; END IF;
  END IF;
  IF v_city IS NOT NULL THEN
    SELECT l.id INTO v_city_id FROM public.locations l WHERE lower(l.name)=lower(v_city) AND l.location_type='city' ORDER BY CASE WHEN v_state IS NOT NULL AND lower(l.state)=lower(v_state) THEN 0 ELSE 1 END LIMIT 1;
    IF v_city_id IS NULL THEN
      v_slug := regexp_replace(lower(v_city),'[^a-z0-9]+','-','g');
      INSERT INTO public.locations(name,slug,location_type,city,state,country,latitude,longitude,aliases,metadata)
      VALUES(v_city,v_slug,'city',v_city,v_state,v_country,p_latitude,p_longitude,ARRAY[]::text[],'{"source":"property_import"}'::jsonb)
      ON CONFLICT (slug,location_type) DO UPDATE SET state=COALESCE(public.locations.state,EXCLUDED.state),country=COALESCE(public.locations.country,EXCLUDED.country),latitude=COALESCE(public.locations.latitude,EXCLUDED.latitude),longitude=COALESCE(public.locations.longitude,EXCLUDED.longitude),updated_at=now()
      RETURNING id INTO v_city_id;
    END IF;
  END IF;
  IF v_name IS NULL OR lower(v_name)=lower(COALESCE(v_city,'')) THEN RETURN v_city_id; END IF;
  v_slug := regexp_replace(lower(v_name),'[^a-z0-9]+','-','g');
  INSERT INTO public.locations(parent_location_id,name,slug,location_type,city,state,country,latitude,longitude,aliases,metadata)
  VALUES(v_city_id,v_name,v_slug,'locality',v_city,v_state,v_country,p_latitude,p_longitude,ARRAY[]::text[],'{"source":"property_import"}'::jsonb)
  ON CONFLICT (slug,location_type) DO UPDATE SET parent_location_id=COALESCE(public.locations.parent_location_id,EXCLUDED.parent_location_id),city=COALESCE(public.locations.city,EXCLUDED.city),state=COALESCE(public.locations.state,EXCLUDED.state),country=COALESCE(public.locations.country,EXCLUDED.country),latitude=COALESCE(public.locations.latitude,EXCLUDED.latitude),longitude=COALESCE(public.locations.longitude,EXCLUDED.longitude),updated_at=now()
  RETURNING id INTO v_location_id;
  RETURN COALESCE(v_location_id,v_city_id);
END;
$function$;

REVOKE ALL ON FUNCTION public.resolve_project_location(text,text,text,text,double precision,double precision) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resolve_project_location(text,text,text,text,double precision,double precision) TO authenticated;

CREATE OR REPLACE FUNCTION public.run_property_recommendations(p_lead_id uuid, p_limit integer DEFAULT 20)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public','pg_temp'
AS $function$
DECLARE v_tenant_id uuid; v_requirement_id uuid; v_run_id uuid; v_limit integer := LEAST(GREATEST(COALESCE(p_limit,20),1),100);
BEGIN
  SELECT l.tenant_id INTO v_tenant_id FROM public.leads l WHERE l.id=p_lead_id;
  IF v_tenant_id IS NULL THEN RAISE EXCEPTION 'lead not found'; END IF;
  IF v_tenant_id <> public.crm_current_tenant_id() THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT r.id INTO v_requirement_id FROM public.requirements r WHERE r.lead_id=p_lead_id AND r.is_active=true ORDER BY r.created_at DESC LIMIT 1;
  IF v_requirement_id IS NULL THEN RAISE EXCEPTION 'active requirement not found'; END IF;
  INSERT INTO public.recommendation_runs(tenant_id,lead_id,requirement_id,algorithm_version,query_snapshot,candidate_count)
  SELECT v_tenant_id,p_lead_id,r.id,'rules-v2',jsonb_build_object('budget_min',r.budget_min,'budget_max',r.budget_max,'bedrooms_min',r.bedrooms_min,'bedrooms_max',r.bedrooms_max,'bathrooms_min',r.bathrooms_min,'area_min_sqft',r.area_min_sqft,'area_max_sqft',r.area_max_sqft,'requirement_type',r.requirement_type,'purpose',r.purpose,'possession_before',r.possession_before,'preferred_facing',r.preferred_facing,'preferred_floor_min',r.preferred_floor_min,'preferred_floor_max',r.preferred_floor_max,'parking_required',r.parking_required,'furnishing',r.furnishing),0
  FROM public.requirements r WHERE r.id=v_requirement_id RETURNING id INTO v_run_id;
  WITH candidates AS (
    SELECT p.id project_id,u.id unit_id,l.id listing_id,p.name project_name,d.name developer_name,loc.name location_name,
      COALESCE(CASE WHEN r.requirement_type IN ('rent','lease') THEN l.rent_amount ELSE l.asking_price END,u.asking_price,c.price_min,p.price_min) candidate_price,
      COALESCE(u.bedrooms,c.bedrooms) bedrooms,COALESCE(u.bathrooms,c.bathrooms) bathrooms,
      COALESCE(u.super_builtup_area_sqft,u.builtup_area_sqft,u.carpet_area_sqft,c.super_builtup_area_max,c.builtup_area_max,c.carpet_area_max) area_sqft,
      u.floor_number,u.facing,COALESCE(u.parking_count,0) parking_count,COALESCE(l.furnishing,r.furnishing) furnishing,
      u.status unit_status,p.possession_date,p.status project_status,p.property_category,p.latitude,p.longitude,p.location_id,r.*
    FROM public.requirements r JOIN public.projects p ON true LEFT JOIN public.developers d ON d.id=p.developer_id LEFT JOIN public.locations loc ON loc.id=p.location_id
    LEFT JOIN public.project_configurations c ON c.project_id=p.id LEFT JOIN public.units u ON u.project_id=p.id AND (c.id IS NULL OR u.configuration_id=c.id)
    LEFT JOIN LATERAL (SELECT l1.* FROM public.listings l1 WHERE l1.unit_id=u.id AND l1.tenant_id=v_tenant_id AND l1.status='active' AND ((r.requirement_type IN ('rent','lease') AND l1.listing_type IN ('rent','lease')) OR (r.requirement_type='resale' AND l1.listing_type='resale') OR (r.requirement_type='buy' AND l1.listing_type IN ('primary_sale','resale'))) ORDER BY l1.created_at DESC LIMIT 1) l ON true
    WHERE r.id=v_requirement_id AND p.status <> 'inactive' AND CASE WHEN r.requirement_type IN ('rent','lease','resale') THEN l.id IS NOT NULL ELSE p.property_category IN ('primary_sale','resale') END AND (u.id IS NULL OR u.status IN ('available','reserved')) AND (u.id IS NOT NULL OR c.id IS NOT NULL)
  ), scored AS (
    SELECT c.*,
      CASE WHEN c.candidate_price IS NULL OR (c.budget_min IS NULL AND c.budget_max IS NULL) THEN 60 WHEN c.candidate_price BETWEEN COALESCE(c.budget_min,c.candidate_price) AND COALESCE(c.budget_max,c.candidate_price) THEN 100 WHEN c.budget_max IS NOT NULL AND c.candidate_price<=c.budget_max*1.10 THEN 75 WHEN c.budget_min IS NOT NULL AND c.candidate_price>=c.budget_min*0.90 THEN 75 ELSE 20 END::numeric budget_score,
      CASE WHEN c.bedrooms IS NULL OR c.bedrooms_min IS NULL THEN 60 WHEN c.bedrooms BETWEEN c.bedrooms_min AND COALESCE(c.bedrooms_max,c.bedrooms_min) THEN 100 WHEN abs(c.bedrooms-c.bedrooms_min)=1 THEN 60 ELSE 0 END::numeric configuration_score,
      CASE WHEN c.bathrooms IS NULL OR c.bathrooms_min IS NULL THEN 60 WHEN c.bathrooms>=c.bathrooms_min THEN 100 ELSE 30 END::numeric bathroom_score,
      CASE WHEN c.area_sqft IS NULL OR (c.area_min_sqft IS NULL AND c.area_max_sqft IS NULL) THEN 60 WHEN c.area_sqft BETWEEN COALESCE(c.area_min_sqft,c.area_sqft) AND COALESCE(c.area_max_sqft,c.area_sqft) THEN 100 WHEN c.area_min_sqft IS NOT NULL AND c.area_sqft>=c.area_min_sqft*0.90 THEN 75 WHEN c.area_max_sqft IS NOT NULL AND c.area_sqft<=c.area_max_sqft*1.10 THEN 75 ELSE 20 END::numeric size_score,
      CASE WHEN NOT EXISTS(SELECT 1 FROM public.requirement_locations rl WHERE rl.requirement_id=v_requirement_id) THEN 60 WHEN EXISTS(SELECT 1 FROM public.requirement_locations rl WHERE rl.requirement_id=v_requirement_id AND rl.location_id=c.location_id) THEN 100 WHEN EXISTS(SELECT 1 FROM public.requirement_locations rl JOIN public.locations wanted ON wanted.id=rl.location_id WHERE rl.requirement_id=v_requirement_id AND (wanted.parent_location_id=c.location_id OR c.location_id=wanted.parent_location_id)) THEN 90 WHEN EXISTS(SELECT 1 FROM public.requirement_locations rl JOIN public.locations wanted ON wanted.id=rl.location_id WHERE rl.requirement_id=v_requirement_id AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL AND wanted.latitude IS NOT NULL AND wanted.longitude IS NOT NULL AND ST_DWithin(ST_SetSRID(ST_MakePoint(c.longitude,c.latitude),4326)::geography,ST_SetSRID(ST_MakePoint(wanted.longitude,wanted.latitude),4326)::geography,COALESCE(rl.max_distance_km,10)*1000)) THEN 80 ELSE 30 END::numeric location_score,
      CASE WHEN c.unit_id IS NOT NULL OR c.listing_id IS NOT NULL OR c.project_status IN ('launched','under_construction','ready_to_move','completed') THEN 100 ELSE 60 END::numeric availability_score,
      CASE WHEN c.possession_before IS NULL OR c.possession_date IS NULL THEN 70 WHEN c.possession_date<=c.possession_before THEN 100 ELSE 10 END::numeric possession_score,
      CASE WHEN c.required_furnishing IS NULL OR c.furnishing IS NULL THEN 60 WHEN c.required_furnishing=c.furnishing THEN 100 ELSE 40 END::numeric furnishing_score,
      CASE WHEN c.preferred_facing IS NULL OR c.facing IS NULL THEN 60 WHEN lower(c.preferred_facing)=lower(c.facing) THEN 100 ELSE 40 END::numeric facing_score,
      CASE WHEN c.preferred_floor_min IS NULL AND c.preferred_floor_max IS NULL THEN 60 WHEN c.floor_number BETWEEN COALESCE(c.preferred_floor_min,c.floor_number) AND COALESCE(c.preferred_floor_max,c.floor_number) THEN 100 ELSE 40 END::numeric floor_score,
      CASE WHEN c.parking_required IS NULL THEN 60 WHEN c.parking_count>=c.parking_required THEN 100 ELSE 25 END::numeric parking_score
    FROM candidates c
  ), ranked AS (
    SELECT s.*,ROUND(s.budget_score*0.24+s.location_score*0.22+s.configuration_score*0.15+s.bathroom_score*0.05+s.size_score*0.09+s.availability_score*0.10+s.possession_score*0.05+s.parking_score*0.05+((s.furnishing_score+s.facing_score+s.floor_score)/3)*0.05,2) total_score,
      jsonb_build_array(CASE WHEN s.budget_score>=75 THEN 'Budget aligned' ELSE 'Budget stretch' END,CASE WHEN s.location_score>=90 THEN 'Preferred location' WHEN s.location_score>=80 THEN 'Near preferred location' ELSE 'Location compromise' END,CASE WHEN s.configuration_score>=100 THEN 'Exact bedroom match' ELSE 'Near bedroom match' END,CASE WHEN s.bathroom_score>=100 THEN 'Bathroom requirement met' ELSE 'Bathroom trade-off' END,CASE WHEN s.availability_score>=80 THEN 'Viable inventory' ELSE 'Availability needs verification' END,CASE WHEN s.parking_score>=100 THEN 'Parking requirement met' ELSE 'Parking trade-off' END) reasons_calc
    FROM scored s
  ), top AS (SELECT ranked.*,row_number() OVER(ORDER BY total_score DESC,project_name,unit_id NULLS LAST) rn FROM ranked WHERE total_score>0 LIMIT v_limit)
  INSERT INTO public.recommendation_results(recommendation_run_id,project_id,unit_id,listing_id,rank,total_score,budget_score,location_score,configuration_score,size_score,project_score,availability_score,preference_score,semantic_score,reasons)
  SELECT v_run_id,project_id,unit_id,listing_id,rn,total_score,budget_score,location_score,configuration_score,size_score,CASE WHEN project_status IN ('launched','under_construction','ready_to_move','completed') THEN 100 ELSE 70 END,availability_score,(furnishing_score+facing_score+floor_score+parking_score)/4,0,jsonb_build_object('summary',reasons_calc,'project_name',project_name,'developer',developer_name,'location',location_name,'price',candidate_price,'bedrooms',bedrooms,'bathrooms',bathrooms,'area_sqft',area_sqft,'facing',facing,'floor',floor_number,'parking',parking_count)
  FROM top;
  UPDATE public.recommendation_runs SET candidate_count=(SELECT count(*) FROM public.recommendation_results WHERE recommendation_run_id=v_run_id) WHERE id=v_run_id;
  RETURN v_run_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.run_property_recommendations(uuid,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.run_property_recommendations(uuid,integer) TO authenticated;
