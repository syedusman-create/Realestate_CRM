CREATE OR REPLACE FUNCTION public.link_requirement_location_from_notes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public','pg_temp'
AS $function$
BEGIN
  IF NULLIF(trim(NEW.notes), '') IS NULL THEN RETURN NEW; END IF;
  INSERT INTO public.requirement_locations(requirement_id,location_id,preference_level,max_distance_km,is_must_have)
  SELECT NEW.id,l.id,1,10,false
  FROM public.locations l
  WHERE lower(l.name)=lower(trim(NEW.notes))
     OR lower(trim(NEW.notes))=ANY(SELECT lower(value) FROM unnest(l.aliases) AS value)
  ORDER BY CASE WHEN l.location_type IN ('locality','sub_locality','micro_market','city') THEN 0 ELSE 1 END
  LIMIT 1
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_requirements_location_from_notes ON public.requirements;
CREATE TRIGGER trg_requirements_location_from_notes
AFTER INSERT ON public.requirements
FOR EACH ROW EXECUTE FUNCTION public.link_requirement_location_from_notes();

REVOKE ALL ON FUNCTION public.link_requirement_location_from_notes() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.link_requirement_location_from_notes() TO authenticated;
