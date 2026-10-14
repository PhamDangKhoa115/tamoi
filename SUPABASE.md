# Supabase setup, security and moderation

The source integration is complete. The public URL/key supplied for `kakmmembzldyyvjjjgzh` are configured in `js/supabase-config.js`. They are browser configuration, not administrative credentials. The project currently returns **PGRST205** for the table; apply the migration manually before expecting live submission success.

## 1. Apply the SQL migration

1. Open your intended Supabase project → SQL Editor → New query.
2. Review/backup any existing `public.restaurant_submissions` table. Paste the **entire** file `supabase/migrations/202610140001_restaurant_submissions.sql`, including BEGIN/COMMIT, and Run.
3. The migration creates the table if missing. If it exists, it checks column types and the `id` primary key and refuses incompatible schemas rather than altering or deleting records. It resets defaults, tightens privileges and installs its own policies/trigger; it does not delete or rewrite existing rows. Review any custom integrations that previously relied on public access.
4. Length/area/status constraints are added `NOT VALID` so legacy records are preserved. New INSERT/UPDATE operations are checked immediately. Audit incompatible legacy rows manually; validate each `tamoi_*` constraint later with `ALTER TABLE public.restaurant_submissions VALIDATE CONSTRAINT tamoi_name_length;` (repeat for the other five named constraints). Do not automatically delete legacy records.
5. A schema cache reload notification is included. If the Data API still reports PGRST205, confirm the project/table, commit success and public schema exposure; try `NOTIFY pgrst, 'reload schema';` as administrator. Do not disable RLS to fix a connection problem.

`created_at`, `id`, `status` and `approved_at` are protected. The insert trigger always generates a UUID, server timestamp, `pending` status and null approval timestamp. New rows are pending even if an administrator inserts them; approve with an UPDATE after review.

## 2. Public configuration (local and Vercel)

The website has no required build. It ships the official SDK **2.117.3**, pinned and self-hosted at `js/vendor/supabase.js`; license, source URL and SHA-256 are included alongside it. Only the homepage loads this SDK. No runtime, React, animation or game migration is involved.

No-build option: edit these two properties in `js/supabase-config.js`:

```js
window.TamOiSupabaseConfig = Object.freeze({
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_YOUR_PUBLIC_KEY'
});
```

Use the project **origin**, not a `/rest/v1/` URL. Publishable keys are expected in this integration; legacy JWT anon keys are intentionally not accepted. Never use `sb_secret_…`, service_role, database passwords or secret CAPTCHA keys. Anyone can see the public config; database grants and RLS protect the data.

Optional environment generation:

```powershell
$env:SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co'
$env:SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_YOUR_PUBLIC_KEY'
node tools/configure-supabase.cjs
node tools/serve.cjs
```

`.env.example` documents the names; the generator does not parse .env files. In Vercel, set the two variables per environment and set Build Command to `node tools/configure-supabase.cjs`, Output Directory `.`. Server environment values are **not** automatically accessible from browser JavaScript. The generator explicitly emits only the two public values and rejects secret keys. The checked-in config already contains your provided public values, so the build command is optional if you keep that file configured.

## 3. Permissions and privacy

| Actor | Allowed | Denied |
| --- | --- | --- |
| `anon` / `authenticated` | INSERT restaurant_name, area, story, nickname; SELECT id, restaurant_name, area, story, status, created_at on approved rows only | Pending/rejected reads; nickname/approved_at reads; protected-column INSERT; all UPDATE/DELETE |
| Dashboard administrator / trusted service role | Review private rows; update status | No administrative credentials in browser |

Both column privileges and RLS are applied. Table and **pre-existing column grants** are revoked first. Restrictive read/insert guards prevent an existing permissive policy from broadening public access. Restrictive UPDATE/DELETE denial also protects against old FOR ALL policies. No permissive public UPDATE policy is created. Unknown custom roles/inherited memberships should be included in your own project security audit; standard Supabase anon/authenticated roles are covered.

The browser never signs in, persists auth sessions or extracts tokens from URL fragments. Nickname is optional and retained only for private moderation; it is not displayed because consent is for anonymous publication. Consent is required in both the UI and service, but it is not a cryptographically verifiable audit trail; direct REST callers can bypass browser consent checks. If audited consent is required, record/verify it at a trusted submission endpoint.

The service uses `.insert()` without `.select()`: pending rows are intentionally unreadable to the submitter. Success is shown only after a successful database HTTP response; a network timeout/response loss is treated as **unconfirmed**, not successful. No write retries are performed by the application. Such an ambiguous failure might still have committed remotely; avoid resubmitting repeatedly and check the Dashboard if appropriate.

Shared submissions never use localStorage. Existing demo storage is ignored and is not imported, publicly exposed, overwritten or deleted. All six seeded restaurants remain. Approved rows merge by normalized restaurant name + area, preferring seed data; multiple same-name submissions remain separate moderation records but display as one card. New user cards state the address is unverified and use a Google Maps **search** link based on name/area, rather than pretending to have a verified address. Existing seeded address/direction links remain intact. All user text is rendered by the existing runtime as text nodes.

## 4. Manual moderation

1. Supabase Dashboard → Table Editor → `restaurant_submissions` → filter `status = pending`.
2. Review restaurant name, area, story and optional nickname. Remove inappropriate/private details before publication; verify permission and factual claims. A nickname is never included in the public query.
3. Change **only status** to `approved` to publish. The trigger sets `approved_at` from server time automatically. Or set status to `rejected` to keep it unpublished; the trigger clears approved_at.
4. Refresh the website. This version fetches approved rows on page load; it does not subscribe to Realtime or poll the database.

Equivalent administrator SQL for one reviewed row:

```sql
UPDATE public.restaurant_submissions
SET status = 'approved'
WHERE id = 'REPLACE_WITH_REVIEWED_UUID'::uuid AND status = 'pending';
```

Use a valid UUID and only the intended row. To unpublish a reviewed record, change its status to `rejected`. Do not paste an administrative key into the public website and do not grant UPDATE to anon/authenticated.

## 5. Live verification after your migration

1. Serve locally over HTTP (`node tools/serve.cjs`) or use a Vercel Preview. Open DevTools Network. Submit a distinct test restaurant, valid area/story, optional nickname and consent.
2. Confirm one POST to `/rest/v1/restaurant_submissions` sends exactly the four allowed fields and receives a successful response. Confirm the success message explains review and the form resets only afterward.
3. In the Dashboard, find the test row: UUID and created_at generated; status pending; approved_at null. Refresh the website and open another browser: the pending restaurant must not appear, including after clearing localStorage.
4. Set status to rejected: it must remain invisible. Set it back to pending, then approve it in the Dashboard. Refresh both browsers: the restaurant appears once, count updates, area filtering works, and the card offers Maps search without a fabricated address. Featured Ba Thiện and the other seeds remain.
5. Try blank/long values and missing consent; there should be no POST. Double-click submit during a slow connection; there should be one POST. Use offline mode/request blocking or a development database error: an error appears and all inputs remain, with no success claim.
6. In a development project, run `supabase/tests/restaurant_submissions.sql` in SQL Editor as postgres. It exercises anonymous pending/rejected denial, approved visibility, protected status INSERT, UPDATE/DELETE denial and private-column denial, then rolls back test rows. Do not use it in production if external triggers/webhooks can cause side effects even on rollback. An intentional failure leaves the transaction aborted; issue ROLLBACK before continuing.
7. Verify mobile layout and all six pages, original animations, navigation, games, tabs and article views at the actual deployment URL.

## 6. Spam protection limits

Implemented: client and database length/area validation, explicit payload whitelist, consent validation, disabled/loading button, duplicate-request locks, moderation before public visibility, safe text rendering. These controls are **not server rate limiting**; public INSERT remains callable outside this form. RLS is authorization, not a CAPTCHA or abuse quota.

For stronger protection, move submission POSTs to a trusted Vercel or Supabase Edge Function endpoint. Verify a CAPTCHA token server-side using a secret stored only in that environment; enforce a shared IP/request rate limit, request body limits and an idempotency token with a server-side unique constraint. Revalidate the four submission fields there and write with a server-only credential. Then revoke direct INSERT from anon/authenticated so callers cannot bypass that endpoint. Keep anonymous approved reads through RLS. This extra endpoint is recommended, **not implemented** in this initial direct-Supabase integration.

## 7. What was actually verified

- Implemented: migration, official client, configuration, submission service, async homepage discovery/submission, moderation and deployment documentation.
- Locally verified: actual PostgreSQL SQL behavior in PGlite; official SDK HTTP contract against test-only intercepted REST fixtures in real Chrome; all-six-page regressions; preserved-file checksums.
- Hosted project: read-only preflight reached your supplied project and returned PGRST205. No remote migration or data writes were made.
- Not yet verified: hosted insertion/persistence, real Dashboard approval, cross-client production visibility, deployed Vercel behavior. These await your manual migration and the live steps above. Local mock persistence is not claimed as real Supabase persistence.

References: [Official client installation](https://supabase.com/docs/reference/javascript/installing), [Publishable API keys](https://supabase.com/docs/guides/getting-started/api-keys), [Column privileges](https://supabase.com/docs/guides/database/postgres/column-level-security), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
