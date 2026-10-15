# Google Analytics 4 — integration and verification

Website: https://tamoi.vercel.app  
Measurement ID: **G-B51G96ZP8R**

All six HTML files load `js/analytics.js` exactly once in the head. This module installs the official asynchronous Google tag `https://www.googletagmanager.com/gtag/js?id=G-B51G96ZP8R` **only after explicit analytics acceptance**. No GTM container or extra dependency is used. Local source and the production homepage HTML were scanned before integration; neither contained a GA/GTM tag. Production has not been changed/deployed by this work.

## Required GA4 administrator settings before publishing

In GA4 Admin → Data streams → select the web stream for G-B51G96ZP8R:

1. **Turn Enhanced Measurement OFF.** This integration explicitly tracks the required interactions and page views. Automatic outbound link/form events could include Maps query URLs containing submitted restaurant names. Automatic browser-history page views can also duplicate manual views. `send_page_view: false` alone does not disable account-side Enhanced Measurement history tracking.
2. Keep user-provided data collection, advertising personalization and Google Signals disabled. This source also explicitly sets `allow_google_signals: false`, `allow_ad_personalization_signals: false`, and all advertising consent types to denied.
3. Do not add another GA tag, GTM container or duplicate event rule for the same interactions. Review any existing Google tag event modifications/additional destinations; they are account-managed and cannot be audited from these files.
4. For reporting, optionally register event-scoped custom dimensions for `restaurant_area`, `page_name`, `area`, `article_id`, `tab_id` and `ingredient_id`. Do not register or collect free-form user text.

Account settings require GA4 administrator access and were **not changed or verified** here. Disabling automatic measurement is a required privacy/duplicate-prevention step before publishing; the source allowlist controls only this application's custom events, not remotely configured Google automatic events.

References: [Google page-view documentation](https://developers.google.com/analytics/devguides/collection/ga4/views?technology=websites), [configuration reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/config), [consent mode](https://developers.google.com/tag-platform/security/guides/consent).

## Consent and privacy

- Basic opt-in mode for every visitor: no Google tag network request, Analytics cookie or queued measurement event before acceptance. Events performed before acceptance are discarded rather than replayed.
- Google consent defaults are set before config/events: analytics_storage denied; ad_storage, ad_user_data and ad_personalization always denied. Only analytics_storage can become granted.
- A Vietnamese consent notice appears outside `#app`, so the custom runtime never reconciles it. Accept and decline controls are both available. The persistent **Quyền riêng tư** button reopens preferences on every page. Expand **Chi tiết quyền riêng tư** for the visible privacy notice; `PRIVACY.md` records the same policy in source documentation.
- Preference key `tamoi.analytics.consent.v1` contains only choice, version and timestamp, expiring after 180 days. This is separate from restaurant submission consent and is not restaurant persistence. Unavailable/malformed/expired preference storage defaults to no tracking. A current-page choice still works if storage is blocked, but cannot persist.
- Withdrawal sets Google's `ga-disable-G-B51G96ZP8R` opt-out flag, denies consent, removes this implementation's host-only `_ga*` cookies and removes unprocessed event commands. Other tabs react to storage changes. Already transmitted, previously consented data cannot be recalled by browser code.
- Google Analytics cookies are host-only, have a configured maximum lifetime of 180 days and are not refreshed on each request. Google's own consent/cookie processing and server retention settings still need to be reviewed in the GA4 account.
- No form listeners collect field contents. Custom events accept only known event names, exact parameter names and enum values. They never include restaurant names, stories, nicknames, emails, Supabase configuration/tokens or Maps URLs.
- Page context uses fixed titles and canonical HTML URLs under tamoi.vercel.app. Query strings, fragments and referrers are omitted. Article hashes emit an article identifier, not a second page view. Google necessarily sees connection-level technical data/IP when a consented browser contacts its service; the notice explains this.

## Custom events and triggers

| Event | Successful action / duplicate guard | Parameters |
| --- | --- | --- |
| restaurant_submit_success | Only after `await TamOiSubmissions.submitRestaurant(input)` resolves with a confirmed HTTP success; not on invalid input, missing consent or failed/ambiguous request | restaurant_area: one of five fixed areas; page_name: home |
| restaurant_filter | Existing area handler changes area; clicking already selected area is ignored for analytics | area: all or one of five fixed areas |
| restaurant_directions_click | Existing restaurant link handler activates a Maps direction/search link | None; no URL or restaurant name |
| article_open | Existing article opens, direct valid article hash on load, or valid hash navigation; handler/state comparison prevents click + hashchange double counting | article_id: article_1…article_8 |
| interview_tab_change | Existing person tab changes; repeated selection suppressed | tab_id: person_1…person_3 (no interviewee names) |
| rice_game_start | Scoop action leaves start state | None |
| rice_game_complete | Serve action reaches receipt; repeat completion suppressed | None |
| rice_game_restart | Reset action begins a new round | None |
| myth_game_start | First valid answer in a new quiz round (not mere page load) | None |
| myth_game_complete | Final answered question advances to certificate; existing next guard prevents duplicate | None |
| myth_game_restart | Existing replay action resets the round | None |
| ingredient_select | Existing ingredient handler changes selection | ingredient_id: com, suon, bi, cha, trung, mam, dochua |

Page views: `send_page_view: false` and one explicit `page_view` after acceptance per HTML document load. Page navigation/refresh is a new document; article hash changes are custom article events. Revoking/regranting consent on the same document does not intentionally create another page view. The module is a singleton, and tracking failures are caught. No new global click listener, runtime patch, scoring change or Supabase service change was introduced.

## Tests actually run

- `node tools/check.cjs`: six HTML files, JavaScript syntax, local references, 37 images and Vercel config pass.
- `node tools/test-analytics.cjs`: real Chrome, test-intercepted Google tag and Supabase HTTP responses. Covers no requests before consent/after decline; opt-in tag ID; one queued page view; navigation across all six pages; exact custom event counts; valid/failed/double Supabase submits; enum/parameter privacy rejection; withdrawal, cookies, cross-tab preference changes, unavailable storage, blocked/throwing analytics; mobile consent; preserved-file SHA-256 checks.
- `node tools/test-supabase-browser.cjs`: restaurant behavior and all-six-page regression suite pass, including both complete game/reset flows, tabs, article details, ingredient illustrations, mobile layout and asynchronous focus/input preservation. This regression suite explicitly declines optional analytics.
- `node tools/test-supabase-service.cjs` and `node tools/test-supabase-sql.cjs`: service behavior and local PostgreSQL RLS tests pass. The preservation test now uses the current analytics baseline because analytics hooks necessarily change HTML pages; CSS/runtime/animations/Supabase/Vercel files remain unchanged.
- Read-only official tag download: HTTP 200 for the correct measurement ID. This verifies URL availability, not live GA collection or browser execution of Google's real tag.

Evidence is under `test-results/analytics-results.json`, `analytics-preservation-baseline.json`, `ga4-tag-load.json`, `ga4-production-preflight.json` and analytics PNG screenshots. Offline browser tests inspect the application's gtag dataLayer commands; they **do not claim Google's servers accepted those events**. GA4 account settings, Tag Assistant, Realtime and DebugView have not been accessed. No deployment or live analytics event was sent intentionally by the test suite.

## Live verification after authorized deployment

1. Complete the GA4 administrator settings above, then publish through the existing GitHub/Vercel process when authorized. No Vercel config or build change is required.
2. Open [Google Tag Assistant](https://tagassistant.google.com/) and connect the actual deployed site. Use a fresh profile/clear only this site's consent preference for the test. Before choosing, verify there is no gtag.js or Analytics collect request.
3. Decline: confirm no Analytics collect requests and that navigation, form submission and games still work. Reopen **Quyền riêng tư** and accept: verify one G-B51G96ZP8R tag, advertising consent denied and one page_view.
4. Navigate each of six HTML pages: expect a new single page_view. Open article details: expect article_open with a fixed ID and no extra history page_view. Filter/select/tab actions should emit once per changed selection. Inspect request payloads for unexpected automatic events/PII; stop analytics and review stream settings if any appear.
5. Test an invalid/failed restaurant request: no success event. Test a real successful pending Supabase insert: exactly one restaurant_submit_success with only area/home. Actual Supabase persistence still depends on its migration/configuration; analytics does not bypass that setup.
6. Complete and restart each game; inspect the three lifecycle event names. Trigger ingredient selection and Maps search/directions; confirm no link_url, restaurant name, story, nickname or token appears.
7. Verify in GA4 Realtime. For DebugView, use Tag Assistant's debug session; production source does not enable debug_mode for all visitors. Check **Admin → DebugView** for event sequence/params. Account reporting delays or blockers may affect visibility; Network/Tag Assistant success alone is not proof that GA4 reports contain data.
8. Withdraw consent, verify ga-disable is true and `_ga*` cookies disappear; no new custom events should be sent. Recheck on mobile and with a tracker blocker. If the tag is blocked, site functionality should remain usable.

No live GA4 collection is marked verified until these account-side tests pass.
