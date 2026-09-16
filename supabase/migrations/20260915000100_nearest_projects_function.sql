CREATE OR REPLACE FUNCTION public.get_nearest_projects(
  p_latitude double precision,
  p_longitude double precision,
  p_radius_km numeric DEFAULT 25,
  p_limit integer DEFAULT 20
)
RETURNS TABLE(
  project_id uuid,
  project_name text,
  developer_name text,
  city text,
  location_name text,
  latitude double precision,
  longitude double precision,
  distance_km numeric,
  status text,
  price_min numeric,
  price_max numeric
)
LANGUAGE sql STABLE
SET search_path TO 'public','pg_temp'
AS $function$
  SELECT p.id,p.name,d.name,p.city,loc.name,p.latitude,p.longitude,
    ROUND((ST_Distance(ST_SetSRID(ST_MakePoint(p.longitude,p.latitude),4326)::geography,
      ST_SetSRID(ST_MakePoint(p_longitude,p_latitude),4326)::geography)/1000.0)::numeric,2),
    p.status::text,p.price_min,p.price_max
  FROM public.projects p
  LEFT JOIN public.developers d ON d.id=p.developer_id
  LEFT JOIN public.locations loc ON loc.id=p.location_id
  WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL
    AND p.status <> 'inactive'
    AND ST_DWithin(ST_SetSRID(ST_MakePoint(p.longitude,p.latitude),4326)::geography,
      ST_SetSRID(ST_MakePoint(p_longitude,p_latitude),4326)::geography,
      GREATEST(COALESCE(p_radius_km,25),0.1)*1000)
  ORDER BY ST_Distance(ST_SetSRID(ST_MakePoint(p.longitude,p.latitude),4326)::geography,
    ST_SetSRID(ST_MakePoint(p_longitude,p_latitude),4326)::geography)
  LIMIT LEAST(GREATEST(COALESCE(p_limit,20),1),100);
$function$;
