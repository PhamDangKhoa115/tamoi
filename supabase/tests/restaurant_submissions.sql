-- Optional security smoke test. Run AFTER migration in a development Supabase
-- project's SQL Editor as postgres. All test rows are rolled back.
BEGIN;
INSERT INTO public.restaurant_submissions (restaurant_name, area, story, nickname)
VALUES ('TAMOI_RLS_TEST', 'Long Bình', 'Security test; transaction rolls back.', 'PRIVATE_TEST_NICK');
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.restaurant_submissions WHERE restaurant_name = 'TAMOI_RLS_TEST' AND status = 'pending' AND created_at IS NOT NULL AND approved_at IS NULL) THEN
    RAISE EXCEPTION 'Server defaults failed';
  END IF;
END $$;
CREATE FUNCTION pg_temp.expect_permission_denied(command text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  BEGIN
    EXECUTE command;
  EXCEPTION WHEN insufficient_privilege THEN RETURN;
  END;
  RAISE EXCEPTION 'Unexpected permission: %', command;
END $$;
SET LOCAL ROLE anon;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.restaurant_submissions WHERE restaurant_name = 'TAMOI_RLS_TEST') THEN
    RAISE EXCEPTION 'Pending record exposed';
  END IF;
END $$;
SELECT pg_temp.expect_permission_denied('UPDATE public.restaurant_submissions SET status = ''approved'' WHERE restaurant_name = ''TAMOI_RLS_TEST''');
SELECT pg_temp.expect_permission_denied('DELETE FROM public.restaurant_submissions WHERE restaurant_name = ''TAMOI_RLS_TEST''');
SELECT pg_temp.expect_permission_denied('SELECT nickname FROM public.restaurant_submissions');
SELECT pg_temp.expect_permission_denied('SELECT approved_at FROM public.restaurant_submissions');
SELECT pg_temp.expect_permission_denied('INSERT INTO public.restaurant_submissions (restaurant_name, area, story, status) VALUES (''TAMOI_BAD'', ''Long Bình'', ''Test'', ''approved'')');
RESET ROLE;
UPDATE public.restaurant_submissions SET status = 'approved' WHERE restaurant_name = 'TAMOI_RLS_TEST';
SET LOCAL ROLE anon;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.restaurant_submissions WHERE restaurant_name = 'TAMOI_RLS_TEST' AND area = 'Long Bình') THEN
    RAISE EXCEPTION 'Approved record not readable';
  END IF;
END $$;
RESET ROLE;
UPDATE public.restaurant_submissions SET status = 'rejected' WHERE restaurant_name = 'TAMOI_RLS_TEST';
SET LOCAL ROLE anon;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.restaurant_submissions WHERE restaurant_name = 'TAMOI_RLS_TEST') THEN
    RAISE EXCEPTION 'Rejected record exposed';
  END IF;
END $$;
RESET ROLE;
ROLLBACK;
