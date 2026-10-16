# Supabase integration verification — 14/10/2026

The historical audit below describes earlier releases (including the retired localStorage demo). Current Supabase behavior and evidence are recorded here and in SUPABASE.md. Older storage results do not describe this integration.

# Audit và kiểm thử — 10/10/2026

## Audit

Bản gốc có sáu template HTML, runtime patch DOM theo vị trí, 37 ảnh WebP và CSS inline riêng từng trang. Không có framework hay backend. Tương tác gọi Tấm, phỏng vấn, anatomy và quiz vốn hoạt động; không cần viết lại. Ráp dĩa dùng chọn món bằng nút, không kéo thả.

Các lỗi/khoảng trống xử lý: form không lưu sau reload và thông báo gây hiểu nhầm như có hệ thống chia sẻ; chỉ kiểm tra tên quán; article detail chỉ ở state nên không có history; timer chan mắm còn chạy sau khi quay lại; thao tác next lặp có thể bỏ câu; lưới min-width lớn hơn viewport; trang chủ thiếu h1; video có nút không phản hồi; lời kể Ba Thiện không có cảnh báo đủ rõ.

## Bảo toàn bản gốc

- SHA-256 runtime gốc và bản giao giống nhau: `FF452297BDA30FA039B97CB877E8D5C08C586A54192CD8B7280B103F0378E4A9`.
- Cả 37 ảnh có SHA-256 giống bản gốc.
- Sáu khối stylesheet inline gốc giống hoàn toàn, gồm toàn bộ keyframe, class animation, easing, delay, duration và hover. CSS bổ sung nằm riêng.
- So sánh computed animation và transition của toàn bộ phần tử có class tam-* thuộc bản gốc: giống trên cả sáu trang, ở desktop 1440px.
- Chụp full-page bản gốc và bản mới, pause animation tại cùng mốc 2500ms chỉ trong phiên kiểm thử. Screenshot `ve-du-an`, `giai-phau-dia-com`, `rap-dia`, `that-hay-giai-thoai` giống byte-for-byte. Homepage và thông tin có khác biệt nội dung được ghi dưới đây.
- Chạy cả bản gốc và bản mới: bốn trạng thái gọi Tấm; 15 câu trả lời phỏng vấn; bảy phần anatomy; kết quả ráp dĩa sườn trứng/phiếu gọi món/reset; quiz 8/8/replay đều khớp.

## Thay đổi có chủ đích

Không redesign. Giữ màu, font, hình, layout desktop, mô hình chơi và nội dung giáo dục. Khác biệt cần thiết:

1. Homepage: thông báo demo trên cùng trình duyệt, nhãn quán và success thật theo hành vi localStorage. Cảnh báo lời kể Ba Thiện chưa xác nhận. Placeholder phim có phản hồi và chờ URL thật.
2. Thông tin: thêm cảnh báo chờ xác nhận ở bài/attribution Ba Thiện. URL detail `#bai-N` tồn tại sau refresh và hỗ trợ history.
3. Mobile: menu thu gọn ở hai header vốn có nav; grid co lại khi viewport nhỏ. Ba hình trang trí homepage được resize/reposition trong hero để không che text/nút; animation gốc giữ nguyên. CSS giới hạn flex/input/image để tránh tràn.
4. Focus keyboard, keyboard arrow cho tab, smooth scroll (tắt khi reduced motion), h1 ẩn thị giác và main cho homepage.
5. Form kiểm tra bắt buộc, chống trùng/gửi nhanh, lưu demo, giữ input khi lỗi. Timer ráp dĩa huỷ khi quay lại/reset; quiz next được guard. Đây là sửa lỗi, không đổi luật hay thang điểm.

## Kiểm thử thực sự đã chạy

Chrome headless qua Playwright có sẵn trong môi trường; server chỉ listen loopback. Không cài dependency vào website.

| Kiểm tra | Kết quả |
| --- | --- |
| Sáu trang × 320/375/768/1024/1440px | 30 lượt load; scrollWidth bằng viewport; không ảnh hỏng |
| Final mobile sau sửa trang trí | Cả sáu trang 320px và 375px được chụp, không tràn document |
| Lỗi JS và HTTP local | 0 pageerror, 0 local response >=400 trong suite chính |
| Cú pháp JS, relative paths, 37 asset refs, vercel JSON | Pass |
| Character, lọc quán, Maps URL | Character và filter browser pass; Maps dùng URL encode; không xác minh địa chỉ thực địa |
| Form | Focus/text khi gõ, nickname/checkbox giữ trong patch, validation required, persistence reload, literal HTML-like input an toàn |
| Lỗi storage | Mô phỏng Storage.setItem throw; thông báo lỗi, giữ tên/câu chuyện |
| Gửi lặp | Hai submit đồng thời chỉ ghi một record; trùng tên/khu vực bị chặn |
| Reset form | Chỉ sau lưu thành công; form mới có nội dung rỗng |
| Menu | Mở/đóng, Escape, aria-expanded giữ sau state update; touch tap |
| Video trống | Dialog thông báo, không iframe lỗi; đóng được |
| Interview | Chọn người/câu hỏi; keyboard arrow; 15 nội dung khớp bản gốc |
| Articles | Cả tám detail có nội dung; Back/Forward và reload pass |
| Anatomy | Mở cả bảy, tiến độ 7/7; touch tap; nội dung khớp bản gốc |
| Assembly | Chọn món, back trong lúc rót, timer cancellation, chan lại, receipt, reset; touch complete/reset |
| Quiz | Cả tám đáp án gốc, điểm 8/8, replay; double answer/next không skip; touch progression |
| Reduced motion | Sáu trang không còn animation trên các phần tử tam-* đang render |
| So sánh animations/transitions và screenshots | Pass theo chi tiết bảo toàn ở trên |

`tools/check.cjs` có thể chạy lại bằng Node không cần thư viện. Bằng chứng JSON và screenshot nằm ở thư mục verification đi kèm ngoài source website. Những phần tử marquee/timeline cố ý rộng hơn viewport được giữ trong container overflow của bản gốc; không phải document overflow.

## Giới hạn và thông tin còn thiếu

Chưa triển khai lên Vercel và chưa kiểm tra HTTP/cache/CDN trên production thật. Chưa có repo/tài khoản đích, domain, video thật, phê duyệt lời kể Ba Thiện, API/database chung hay TikTok profile dự án cụ thể. Không bịa những giá trị này. Sitemaps/canonical/absolute OG URL cần domain thật. YouTube/TikTok thật chưa có nên chưa test phát video; placeholder đã test. Google Fonts cần mạng. Chỉ test Chrome desktop/headless và mobile emulation; chưa test Safari/iOS hoặc Android thật. Không xác minh lại các thông tin giáo dục, địa chỉ và lời kể được cung cấp; giữ chúng cùng nhãn nguồn/chưa kiểm chứng. Không thay footer/header phụ để ép đồng nhất vì ưu tiên bảo toàn layout gốc.

## Tệp thay đổi và thêm mới

Thay đổi: sáu HTML và README.md. Giữ nguyên: `js/tamoi-runtime.js`, toàn bộ ảnh, toàn bộ stylesheet inline gốc.

Thêm: `css/production.css`, `js/site-config.js`, `js/site-enhancements.js`, `js/restaurant-service.js`, `.gitignore`, `robots.txt`, `vercel.json`, `tools/serve.cjs`, `tools/check.cjs`, `tools/sitemap.cjs`, `DEPLOYMENT.md`, `TESTING.md`. Không có package/framework/dependency mới.

## Bổ sung React Bits-inspired animations — 10/10/2026

Baseline cho đợt này là source production mới nhất được sao lưu trước khi sửa, không phải ZIP gốc. Workspace không có Git repository nên không có branch/commit được tạo; không push/deploy. Archive production cũ được giữ nguyên.

### Phạm vi và bảo toàn

Sáu HTML chỉ thêm marker và include. Bằng kiểm tra trực tiếp: sáu khối stylesheet inline và sáu component script giống baseline byte-for-byte. Runtime, site-config, site-enhancements, restaurant-service, production.css, vercel.json, DEPLOYMENT.md và toàn bộ 37 ảnh có hash giống baseline. Nội dung tiếng Việt và dữ liệu game không đổi.

Thêm năm module `js/animations/`, `css/enhancements.css`, `ANIMATIONS.md`; thêm link tài liệu vào README và bổ sung phần kiểm thử này. Sửa tối thiểu `tools/check.cjs` để duyệt thư mục JS đệ quy sau lỗi EISDIR thực sự được phát hiện. Không thêm dependency/build/server/framework.

### Kết quả kiểm thử

| Trang | Kết quả | Tính năng kiểm tra lại |
| --- | --- | --- |
| index.html | PASS | Character, filters, menu/Escape/touch, validation, typing/focus, consent/nickname, successful save/reset, reload, safe user text, storage failure, rapid/duplicate submission, video placeholder |
| ve-du-an.html | PASS | Interview person/question, active state, keyboard arrow; quote data nguyên bản |
| thong-tin.html | PASS | Tám article details, Back/Forward, refresh, original card/detail animations |
| giai-phau-dia-com.html | PASS | Bảy ingredient interactions, tiến độ 7/7, active states, touch và panel reveal key |
| rap-dia.html | PASS | Selection, back during pouring, timer cancellation, repour, completion receipt, reset, touch |
| that-hay-giai-thoai.html | PASS | Tám câu gốc, điểm 8/8, next/replay, double-answer/double-next không skip, touch |

Chrome headless, local HTTP server listen loopback. `tools/check.cjs` PASS: sáu trang, toàn bộ JS kể cả thư mục animations, asset references, relative src/href và vercel JSON. Không có production build vì website không có build system. Suite interaction chính có 0 pageerror và 0 HTTP local >=400.

### Visual regression

- Sáu trang × 320/375/768/1024/1440px: 30 before/after comparisons với motion bình thường, CSS animation gốc pause tại cùng mốc 2500ms và native entrance được hoàn tất. Layout geometry, font, màu, background, original animation/transition computed styles đều khớp; không document overflow hoặc ảnh hỏng.
- 25/30 screenshot motion-normal giống byte. Các ảnh còn lại có khác biệt raster; capture kiểm soát cũng ghi nhận baseline không đổi tự khác khi được truy cập lại. Không có thay đổi geometry/style tương ứng. Đây không phải bằng chứng rằng tất cả pixel motion-normal khớp tuyệt đối.
- Kiểm tra static độc lập: sáu trang × 320/768/1440px, hai bản cùng reduced motion. **18/18 full-page screenshots giống byte-for-byte**, cùng kích thước, typography, spacing, artwork, palette và layout. Đã xem contact sheets của cả sáu trang.
- Word wrapper đầu tiên gây sai lệch width nhỏ đã được sửa: chỉ dùng wrapper inline tạm, giữ width khi bắt đầu và trả về text node gốc sau entrance/cancel. Bản cuối không còn khác biệt geometry trong 30 so sánh.

### Tests mới của animation

PASS: word fade chạy và trả text gốc cả khi runtime update giữa animation; click một lần tạo đúng bốn sparks; chọn lại cùng ingredient chỉ có spark, không replay panel; đổi ingredient thêm đúng một reveal; spam 40 clicks bị giới hạn bốn burst rồi cleanup hết; keyboard Enter có spark ở giữa nút và giữ focus.

PASS: magnet dùng individual translate trong khi tamWiggle gốc vẫn chạy, pointer exit trở về vị trí cũ; touch không có magnet nhưng có spark. Typing không reinitialize entrance hoặc mất focus. Tải controller hai lần không nhân listener/burst. Không có transform/opacity mới đặt lên phần tử đang có CSS animation gốc.

PASS: đổi reduced-motion trực tiếp cancel motion/particles, nội dung và character vẫn hoạt động, không phát sinh motion mới. Destroy tắt toàn bộ effect nhưng original click handlers vẫn chạy. Chặn tải animation scripts vẫn có heading đọc được và anatomy tương tác được.

Các thay đổi thị giác có chủ đích chỉ trong thời gian entrance, click spark hoặc mouse magnet; resting design không đổi. Giữ nguyên entrance/hover/completion gốc thay vì chồng hiệu ứng tương đương. Xem ANIMATIONS.md cho vị trí và cách tắt từng effect.

### Hạn chế

Vercel configuration/multi-page paths được giữ và đã kiểm tra local HTTP, nhưng chưa deploy thật nên chưa xác minh CDN/production URL. Chưa có Safari/iOS/Android thật hoặc benchmark FPS trên thiết bị thấp. Google Fonts vẫn là dependency mạng từ bản trước. Cần thêm repo/tài khoản đích, domain, video và backend/quote approval khi triển khai các hạng mục đó. Không bịa hoặc cấu hình thêm những giá trị này.

## Supabase integration — current release

- `node tools/check.cjs`: six HTML pages, JS syntax, references, 37 images and Vercel JSON pass.
- `node tools/test-supabase-service.cjs`: validation, consent, request lock, errors, deduplication, rejection of secret keys, client singleton and SHA-256 preservation pass. 50 preserved files include all 37 original images, both stylesheets, five animation modules, runtime, and the other five HTML pages.
- `node tools/test-supabase-sql.cjs`: local PGlite PostgreSQL executes the actual migration; verifies defaults, column grants, RLS, constraints, anon/authenticated denial, manual approval/rejection, repeated migration with existing data, and restrictive protection against a legacy permissive policy. The rollback-only SQL smoke test also executed successfully locally. This is PostgreSQL evidence, not hosted Supabase evidence.
- `node tools/test-supabase-browser.cjs`: real Chrome + official SDK with REST interception. Valid submit, missing consent, invalid input, double submit, normalization, no false success on HTTP/network errors, success-only reset, seeds, filter/count, deduplication, safe rendering, Maps search, mock approval/reload, independence from localStorage, pagination and mobile layout pass. Regression covers all six pages, animation activity, navigation, interview tabs, article detail, ingredient illustrations, complete assembly/reset and eight-question quiz/reset. Zero browser JavaScript errors.
- Read-only live project preflight returned HTTP 404 / PGRST205: table missing from API schema cache. No remote migration, insert, approval, delete or deployment was performed. Actual persistence across clients/refresh and Dashboard moderation await your migration and the live procedure in SUPABASE.md.

Evidence: `test-results/supabase-{service,sql,browser}-results.json`, `supabase-live-preflight.json`, preservation baseline and `supabase-mobile.png`. Browser REST fixtures are test-only and never included by the production homepage. Google Fonts were replaced with an empty CSS response for offline tests; original font requests/URLs in production are unchanged. Mobile uses emulation, not a physical device; Safari/iOS remain untested.

To rerun: install Node, `npm ci --prefix tools/test-deps`, run the commands above. Browser test uses installed Chrome; set CHROME_PATH for a different executable. Test-only packages are not production dependencies and do not require a website build. Do not run rollback security tests on production if external triggers/webhooks have side effects; use a development project.
## Google Analytics integration verification — 15/10/2026

- Added one analytics module reference to each of six HTML heads. Existing handler hooks emit predefined events without altering scoring, Supabase persistence, rendering, navigation or animation logic.
- `node tools/test-analytics.cjs`: real Chrome with intercepted Google tag/Supabase responses. Validates all requested custom events, successful-insert timing, failed/double submit suppression, article hash deduplication, one queued page view per document, navigation, consent opt-in/decline/withdrawal, privacy allowlists, mobile consent UI and preservation checks. Additional tests cover blocked/throwing analytics, unavailable consent storage and cross-tab withdrawal.
- `node tools/test-supabase-browser.cjs`: rerun successfully; consent explicitly declined for this regression suite. Restaurant functionality, async input/focus, six-page animations/navigation, tabs, articles, illustrations and both complete game/reset flows pass.
- `node tools/test-supabase-service.cjs`, `node tools/test-supabase-sql.cjs` and `node tools/check.cjs`: pass. Preservation baseline for this release covers 52 original assets/CSS/runtime/animation/Supabase/vendor/Vercel files. HTML files necessarily include Analytics hooks; previous HTML-preservation assertions are historical.
- Read-only production homepage scan: HTTP 200 and no pre-existing GA/GTM tag matches. Official gtag.js URL for G-B51G96ZP8R: HTTP 200. These checks do not execute Google's real tag or prove collection in GA4.
- Evidence: `test-results/analytics-results.json`, `analytics-preservation-baseline.json`, `ga4-tag-load.json`, `ga4-production-preflight.json`, `analytics-form-success.png`, `analytics-consent-mobile.png`.
- Not verified: Enhanced Measurement/account settings, Google Tag Assistant session, GA4 Realtime/DebugView receipt, production behavior after deployment. Required live instructions are in ANALYTICS.md. Do not label data collection as verified until account-side checks pass. No automatic deployment occurred.

## Analytics popup removal

The former consent popup and floating button are removed from the shared module. All six pages now have a normal footer privacy link. Existing valid opt-ins remain supported; fresh, expired, malformed, denied or blocked-storage preferences remain untracked. Current behavior and verification instructions supersede earlier popup UI descriptions; see ANALYTICS.md and test-results/analytics-no-popup-results.json. Desktop/mobile coverage includes all six pages, without changing the original assets, stylesheets, runtime, animations, Supabase or game rules.

## Footer social links — 16/10/2026

All six original page footers now contain one Facebook SVG link using the existing `https://www.facebook.com/cotamancomtam` URL. Footer TikTok links/text/icons and the detached Facebook icon were removed; other page content mentioning TikTok remains unchanged. The new links use target=_blank, rel=noopener noreferrer and aria-label="Facebook của TẤM ƠI!". Existing footer content and privacy links remain.

Scoped styles in css/footer-social.css add hover/focus treatment and a 44px touch target without changing original stylesheets or animations. The site checker now excludes the existing Google Search Console verification document from its six-content-page count; the verification document itself is unchanged.

`node tools/test-footer-social.cjs` passed all six pages at 1440px desktop and 390px mobile (12 cases): single icon, no footer TikTok/Facebook visible text, exact reused URL, accessible SVG/link, new browser tab, null opener, keyboard focus, hover, touch target and no document overflow. Actual Facebook navigation was intercepted locally; no Facebook account or external page content was accessed. SHA-256 checks confirm all original JS/CSS/images/Vercel configuration and all source outside footer blocks (apart from the new stylesheet reference) remain unchanged, including Search Console verification. No browser JavaScript errors.

`node tools/check.cjs` and `node tools/test-supabase-service.cjs` also pass. Evidence: test-results/footer-social-results.json, footer-social-baseline.json and footer-<page>-<width>.png screenshots. No deployment was performed.
