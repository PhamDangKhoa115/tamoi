# Google Analytics 4 — no-popup consent behavior

Website: https://tamoi.vercel.app  
Measurement ID: **G-B51G96ZP8R**

The large consent popup and floating privacy button have been completely removed. No consent modal, banner or overlay is created on page load on any of the six pages. Visitors can use the site immediately.

All six pages retain the shared js/analytics.js integration and existing custom event hooks. The official Google tag loads **only when tamoi.analytics.consent.v1 contains an existing valid granted choice** (version 1, finite non-future timestamp, less than 180 days old). Fresh visitors, declined/expired/malformed choices and unavailable storage do not load Google tag or queue measurement events. No missing consent is converted to an opt-in. There is currently no visitor-facing control for creating new opt-ins.

Each page has a simple **Quyền riêng tư** footer link to privacy/index.html. This separate static information page has no Analytics tag, no popup and an explicit withdrawal button. Withdrawal saves denied, clears this integration's host GA cookies and propagates to already open tabs through the existing storage listener. No original stylesheet, animation module, runtime, Supabase service/configuration, game rule or Vercel configuration was changed.

## Required GA4 administrator settings before publishing

In GA4 Admin → Data streams → select the web stream for G-B51G96ZP8R:

1. **Turn Enhanced Measurement OFF.** This integration explicitly tracks the required interactions and page views. Automatic outbound link/form events could include Maps query URLs containing submitted restaurant names. Automatic browser-history page views can also duplicate manual views. `send_page_view: false` alone does not disable account-side Enhanced Measurement history tracking.
2. Keep user-provided data collection, advertising personalization and Google Signals disabled. This source also explicitly sets `allow_google_signals: false`, `allow_ad_personalization_signals: false`, and all advertising consent types to denied.
3. Do not add another GA tag, GTM container or duplicate event rule for the same interactions. Review any existing Google tag event modifications/additional destinations; they are account-managed and cannot be audited from these files.
4. For reporting, optionally register event-scoped custom dimensions for `restaurant_area`, `page_name`, `area`, `article_id`, `tab_id` and `ingredient_id`. Do not register or collect free-form user text.

Account settings require GA4 administrator access and were **not changed or verified** here. Disabling automatic measurement is a required privacy/duplicate-prevention step before publishing; the source allowlist controls only this application's custom events, not remotely configured Google automatic events.

References: [Google page-view documentation](https://developers.google.com/analytics/devguides/collection/ga4/views?technology=websites), [configuration reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/config), [consent mode](https://developers.google.com/tag-platform/security/guides/consent).

## Consent and privacy

- Basic consent defaults remain denied; advertising consent and personalization remain disabled.
- Existing valid opt-ins retain one manual page_view per HTML document and identifier-only custom events. Events without consent are discarded, not replayed.
- The local preference contains only choice, version and timestamp. It is separate from the restaurant submission checkbox and does not store restaurant submissions.
- The footer link opens a normal privacy information page. Its withdrawal action uses no tracking. If storage cannot save withdrawal, it explains that the visitor should clear site cookies/storage in browser settings.
- Withdrawal disables new tracking, denies consent, clears host-only _ga cookies and purges unprocessed measurement commands. It cannot recall data already sent while consent was granted.
- Custom event allowlists and sanitized canonical page URLs remain unchanged. No free-form restaurant/form text, credentials, dynamic Maps URL, query string, hash or referrer is included by the application's tracking helper.
- Google receives connection-level technical data/IP only when a consented browser connects to its service. PRIVACY.md and the linked page explain this.

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

## Tests for popup removal

Run from the project root after npm ci --prefix tools/test-deps:

- node tools/test-analytics-no-popup.cjs: all six pages at 1440px desktop and 390px mobile, with fresh, denied, expired, malformed, blocked-storage and granted preferences (72 cases). Asserts no popup/floating button, working footer links, no document overflow and zero Analytics requests/events unless a valid opt-in exists. The linked information page and withdrawal are exercised.
- node tools/test-analytics.cjs: retained custom event, submission timing, privacy allowlist, game lifecycle, navigation, opt-out, blocked tracker and singleton tests. Test-only setConsent calls simulate previously given consent; there is no new public popup/button.
- node tools/test-supabase-browser.cjs: all-six-page regression including form state, restaurant discovery, tabs, articles, illustrations and both complete game/reset flows.
- node tools/check.cjs: six original top-level HTML pages, JavaScript, asset references and Vercel JSON checks. The additional static privacy document is under privacy/ and does not replace an original page.

Reports: test-results/analytics-no-popup-results.json, analytics-results.json and supabase-browser-results.json. Screenshots: no-popup-1440.png and no-popup-390.png. Browser tests use actual Chrome with Google tag/Supabase responses intercepted; they do not claim live GA4 report collection. Historical popup screenshots/results from the earlier implementation are superseded by this report.

## Verification after authorized deployment

No deployment was performed. Before publishing, complete the GA4 account settings above, particularly disabling Enhanced Measurement. Live GA4 account settings, Tag Assistant, Realtime/DebugView receipt and production deployment behavior remain unverified.

1. Open each page in a fresh browser profile on desktop/mobile: there must be no popup, floating privacy button, Google tag request or Analytics collect request. Browse and use forms/games normally.
2. Use each footer link to view privacy information. It is an ordinary page and performs no Analytics collection.
3. For a test profile with an existing valid opt-in, verify one tag for G-B51G96ZP8R, one page_view per HTML load and the custom event sequence in Tag Assistant/Realtime/DebugView. In a controlled test only, the existing TamOiAnalytics.setConsent('granted') API can simulate an opt-in; never invoke it automatically or on behalf of a real visitor.
4. Follow the footer link and press **Tắt phân tích trên thiết bị này**. Return to the site: Analytics remains disabled. Confirm other open tabs also disable tracking and cookies are cleared.
5. Confirm failed/invalid Supabase requests produce no success event and confirmed inserts produce one event with only area/home. No account settings or source code in this change activates unconsented tracking.
