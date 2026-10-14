-- TẤM ƠI! anonymous submissions. Execute the entire file in SQL Editor.
-- Transactional and repeatable; never deletes or rewrites existing records.
BEGIN;

CREATE TABLE IF NOT EXISTS public.restaurant_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_name text NOT NULL,
  area text NOT NULL,
  story text NOT NULL,
  nickname text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz
);

-- Refuse incompatible existing tables instead of silently changing data types.
DO $migration$
DECLARE expected record; actual text;
BEGIN
  FOR expected IN SELECT * FROM (VALUES
    ('id', 'uuid'), ('restaurant_name', 'text'), ('area', 'text'),
    ('story', 'text'), ('nickname', 'text'), ('status', 'text'),
    ('created_at', 'timestamp with time zone'), ('approved_at', 'timestamp with time zone')
  ) AS columns(name, type_name)
  LOOP
    SELECT format_type(a.atttypid, a.atttypmod) INTO actual
    FROM pg_attribute a WHERE a.attrelid = 'public.restaurant_submissions'::regclass
      AND a.attname = expected.name AND NOT a.attisdropped;
    IF actual IS DISTINCT FROM expected.type_name THEN
      RAISE EXCEPTION 'restaurant_submissions.% has type %, expected %. Review existing schema; no data was changed.', expected.name, actual, expected.type_name;
    END IF;
  END LOOP;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c JOIN pg_attribute a
      ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
    WHERE c.conrelid = 'public.restaurant_submissions'::regclass
      AND c.contype = 'p' AND array_length(c.conkey, 1) = 1 AND a.attname = 'id'
  ) THEN
    RAISE EXCEPTION 'Expected an id primary key. Review the existing table before applying this migration.';
  END IF;
END;
$migration$;

ALTER TABLE public.restaurant_submissions
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN approved_at DROP DEFAULT;

-- NOT VALID preserves legacy rows while immediately enforcing new INSERT/UPDATE
-- checks. Audit old rows separately, then VALIDATE CONSTRAINT (see setup docs).
DO $constraints$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.restaurant_submissions'::regclass AND conname = 'tamoi_name_length') THEN
    ALTER TABLE public.restaurant_submissions ADD CONSTRAINT tamoi_name_length
      CHECK (restaurant_name IS NOT NULL AND char_length(btrim(restaurant_name)) BETWEEN 1 AND 120) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.restaurant_submissions'::regclass AND conname = 'tamoi_story_length') THEN
    ALTER TABLE public.restaurant_submissions ADD CONSTRAINT tamoi_story_length
      CHECK (story IS NOT NULL AND char_length(btrim(story)) BETWEEN 1 AND 2000) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.restaurant_submissions'::regclass AND conname = 'tamoi_nickname_length') THEN
    ALTER TABLE public.restaurant_submissions ADD CONSTRAINT tamoi_nickname_length
      CHECK (nickname IS NULL OR char_length(btrim(nickname)) BETWEEN 1 AND 80) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.restaurant_submissions'::regclass AND conname = 'tamoi_valid_area') THEN
    ALTER TABLE public.restaurant_submissions ADD CONSTRAINT tamoi_valid_area
      CHECK (area IS NOT NULL AND area IN ('Long Bình', 'Long Thạnh Mỹ', 'Phước Long B', 'Phước Bình', 'Khu vực khác')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.restaurant_submissions'::regclass AND conname = 'tamoi_valid_status') THEN
    ALTER TABLE public.restaurant_submissions ADD CONSTRAINT tamoi_valid_status
      CHECK (status IS NOT NULL AND status IN ('pending', 'approved', 'rejected')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.restaurant_submissions'::regclass AND conname = 'tamoi_server_timestamp') THEN
    ALTER TABLE public.restaurant_submissions ADD CONSTRAINT tamoi_server_timestamp
      CHECK (created_at IS NOT NULL AND (approved_at IS NULL OR status = 'approved')) NOT VALID;
  END IF;
END;
$constraints$;

CREATE OR REPLACE FUNCTION public.tamoi_submission_defaults()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Protected fields always originate at the server, even on admin insertion.
    NEW.id := gen_random_uuid();
    NEW.status := 'pending';
    NEW.created_at := now();
    NEW.approved_at := NULL;
    NEW.restaurant_name := btrim(NEW.restaurant_name);
    NEW.story := btrim(NEW.story);
    NEW.nickname := nullif(btrim(NEW.nickname), '');
  ELSIF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
    NEW.approved_at := now();
  ELSIF NEW.status IS DISTINCT FROM 'approved' THEN
    NEW.approved_at := NULL;
  ELSE
    NEW.approved_at := OLD.approved_at;
  END IF;
  RETURN NEW;
END;
$function$;
REVOKE ALL ON FUNCTION public.tamoi_submission_defaults() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS tamoi_submission_defaults ON public.restaurant_submissions;
CREATE TRIGGER tamoi_submission_defaults BEFORE INSERT OR UPDATE
  ON public.restaurant_submissions FOR EACH ROW EXECUTE FUNCTION public.tamoi_submission_defaults();

CREATE INDEX IF NOT EXISTS tamoi_approved_created_idx
  ON public.restaurant_submissions (created_at DESC, id DESC) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS tamoi_approved_area_created_idx
  ON public.restaurant_submissions (area, created_at DESC, id DESC) WHERE status = 'approved';

ALTER TABLE public.restaurant_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_submissions FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.restaurant_submissions FROM PUBLIC, anon, authenticated;
-- Table-level REVOKE does not remove pre-existing column ACLs. Revoke those too.
DO $privileges$
DECLARE column_name text;
BEGIN
  FOR column_name IN SELECT attname FROM pg_attribute
    WHERE attrelid = 'public.restaurant_submissions'::regclass AND attnum > 0 AND NOT attisdropped
  LOOP
    EXECUTE format('REVOKE ALL (%I) ON TABLE public.restaurant_submissions FROM PUBLIC, anon, authenticated', column_name);
  END LOOP;
END;
$privileges$;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT (restaurant_name, area, story, nickname) ON public.restaurant_submissions TO anon, authenticated;
GRANT SELECT (id, restaurant_name, area, story, status, created_at) ON public.restaurant_submissions TO anon, authenticated;
-- Nickname and approved_at are never granted to visitors.
-- Dashboard postgres/service_role are trusted administrators, not browser users.
GRANT ALL ON TABLE public.restaurant_submissions TO service_role;

DROP POLICY IF EXISTS tamoi_read_approved ON public.restaurant_submissions;
CREATE POLICY tamoi_read_approved ON public.restaurant_submissions
  FOR SELECT TO anon, authenticated USING (status = 'approved');
DROP POLICY IF EXISTS tamoi_read_approved_guard ON public.restaurant_submissions;
CREATE POLICY tamoi_read_approved_guard ON public.restaurant_submissions AS RESTRICTIVE
  FOR SELECT TO anon, authenticated USING (status = 'approved');
DROP POLICY IF EXISTS tamoi_insert_pending ON public.restaurant_submissions;
CREATE POLICY tamoi_insert_pending ON public.restaurant_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending' AND approved_at IS NULL);
DROP POLICY IF EXISTS tamoi_insert_pending_guard ON public.restaurant_submissions;
CREATE POLICY tamoi_insert_pending_guard ON public.restaurant_submissions AS RESTRICTIVE
  FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending' AND approved_at IS NULL);
-- Restrictive guards also neutralize any pre-existing permissive FOR ALL policies.
DROP POLICY IF EXISTS tamoi_deny_visitor_update ON public.restaurant_submissions;
CREATE POLICY tamoi_deny_visitor_update ON public.restaurant_submissions AS RESTRICTIVE
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS tamoi_deny_visitor_delete ON public.restaurant_submissions;
CREATE POLICY tamoi_deny_visitor_delete ON public.restaurant_submissions AS RESTRICTIVE
  FOR DELETE TO anon, authenticated USING (false);

NOTIFY pgrst, 'reload schema';
COMMIT;
