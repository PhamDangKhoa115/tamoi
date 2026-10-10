# Animation changes and verification

Production remains HTML, CSS and vanilla JavaScript. Original keyframes, artwork, runtime, gameplay and business logic are unchanged.

## Settings

- Split: opacity 0 → 1, vertical travel 28px, duration 850ms, word stagger 65ms. Temporary word spans preserve whitespace; restored to original text after completion. Rich headings use reveal to preserve inline markup and explicit line breaks.
- Reveal: opacity 0 → 1, vertical travel 30px, duration 800ms. Individual translate composes with original transforms. Existing finite CSS animations finish first; infinite animations retain exclusive ownership.
- Cards: entrance reveal plus 8px hover lift on fine pointers. Existing tam-lift hover transforms and shadows remain.
- Spark: eight 14×3px gold particles, 48px radius, 620ms; completion uses ten particles and 68px radius. Capture-phase listener fixes sparks lost when a click replaces its own node. Overlay cannot intercept clicks.
- Magnet: homepage CTA anchors/buttons only; maximum 10px, 220ms easing. Fine mouse pointer only; focus, scroll, exit and teardown reset it.

## Exact markers by page

### giai-phau-dia-com.html

- `h1` `data-tamoi-fx="split"` — Giải phẫu một dĩa cơm tấm
- `button` `data-tamoi-spark="ingredient"` — {{item.name}} {{item.seenLabel}}
- `aside` `data-tamoi-fx="reveal"` `data-tamoi-fx-key="{{cur.name}}"` — {{cur.no}} {{progress}} {{cur.name}} NÓ LÀ GÌ? {{cur.what}} VÌ SAO CÓ MẶT? {{cur.why}} Bạn đã mở hết dĩa cơm! Giờ thử ráp dĩa của riêng bạn .

### index.html

- `a` `data-tamoi-magnet` `data-tamoi-spark="cta"` — Xem phim
- `a` `data-tamoi-magnet` `data-tamoi-spark="cta"` — Gọi thử “Tấm ơi!”
- `h2` `data-tamoi-fx="reveal"` — Theo tiếng gọi, khám phá vị Sài Gòn
- `p` `data-tamoi-fx="reveal"` — TẤM ƠI! là chiến dịch truyền thông giúp Gen Z tại TP.HCM hiểu đúng chữ “tấm” và câu chuyện phía sau dĩa cơm quen thuộc: qua một phim ngắn, một thư viện nhỏ và vài trò chơ
- `h2` `data-tamoi-fx="split"` — Tấm ơi!
- `p` `data-tamoi-fx="reveal"` — Ngoài đường ai cũng gọi “cơm tấm”. Cô Tấm từ truyện cổ tích bước xuống Sài Gòn thì… tưởng người ta gọi mình. Bấm thử coi cô phản ứng sao.
- `button` `data-tamoi-magnet` `data-tamoi-spark="cta"` — Gọi: “Tấm ơi!”
- `h2` `data-tamoi-fx="reveal"` — Bốn cánh cửa vào dĩa cơm tấm
- `a` `data-tamoi-card` `data-tamoi-fx="reveal"` — 01 · THÔNG TIN Nguồn gốc, câu chuyện, lịch sử Thư viện bài viết, mỗi mốc gắn nhãn Có nguồn hoặc Giai thoại.
- `a` `data-tamoi-card` `data-tamoi-fx="reveal"` — 02 · TƯƠNG TÁC Giải phẫu dĩa cơm Bấm từng món: cơm, sườn, bì, chả, trứng, nước mắm, đồ chua.
- `a` `data-tamoi-card` `data-tamoi-fx="reveal"` — 03 · GÓC TRÒ CHƠI Ráp dĩa &amp; đoán thật giả Hai mini game 60 giây, có thẻ kết quả để đăng story.
- `a` `data-tamoi-card` `data-tamoi-fx="reveal"` — 04 · KHO LƯU TRỮ Phim &amp; hậu trường Phim ngắn, trailer, poster, ảnh BTS của buổi quay.
- `h2` `data-tamoi-fx="reveal"` — Mới trong Thông tin
- `a` `data-tamoi-card` `data-tamoi-fx="reveal"` — LỊCH SỬ Cơm tấm bắt đầu từ đâu? Từ hạt gạo vỡ đến món quen của người Sài Gòn.
- `a` `data-tamoi-card` `data-tamoi-fx="reveal"` — NGUỒN GỐC Vì sao gọi là “cơm tấm”? Chữ “tấm” và những hạt gạo bị vỡ.
- `a` `data-tamoi-card` `data-tamoi-fx="reveal"` — QUÁN &amp; CON NGƯỜI Văn hoá quán cơm tấm Sài Gòn Bếp than, ghế nhựa và tiếng gọi món.
- `h2` `data-tamoi-fx="split"` — Góc trò chơi
- `a` `data-tamoi-card` `data-tamoi-fx="reveal"` — GAME 01 Ráp dĩa cơm của bạn Xới cơm, thả topping, chan nước mắm rồi nhận phiếu gọi món của riêng bạn.
- `a` `data-tamoi-card` `data-tamoi-fx="reveal"` — GAME 02 Thật, Sai hay Giai thoại? 8 câu về cơm tấm. Trả lời xong nhận giấy chứng nhận và bí kíp của Tấm.
- `h2` `data-tamoi-fx="split"` — Tấm lạc xuống Sài Gòn
- `h2` `data-tamoi-fx="reveal"` — Cơm tấm Ba Thiện
- `h2` `data-tamoi-fx="split"` — Quán cơm tấm ruột của bạn là quán nào?
- `li` `data-tamoi-card` `data-tamoi-fx="reveal"` `data-tamoi-fx-key="{{s.name}}"` — {{s.name}} {{s.badge}} {{s.addr}} {{s.note}} Chỉ đường

### rap-dia.html

- `h1` `data-tamoi-fx="split"` — Ráp dĩa cơm của bạn
- `button` `data-tamoi-spark="ingredient"` — Xới cơm
- `button` `data-tamoi-spark="ingredient"` — {{t.name}}
- `button` `data-tamoi-spark="ingredient"` — Chan một vòng
- `button` `data-tamoi-spark="success"` — Lên dĩa!
- `b` `data-tamoi-fx="reveal"` — {{result.title}}

### that-hay-giai-thoai.html

- `h1` `data-tamoi-fx="split"` — Thật, Sai hay Giai thoại?
- `h2` `data-tamoi-fx="reveal"` `data-tamoi-fx-key="{{q.text}}"` — “{{q.text}}”
- `button` `data-tamoi-spark="answer"` — Thật
- `button` `data-tamoi-spark="answer"` — Sai
- `button` `data-tamoi-spark="answer"` — Giai thoại
- `div` `data-tamoi-fx="reveal"` — {{verdict}} Đáp án: {{q.label}} {{q.why}}
- `div` `data-tamoi-fx="reveal"` — {{verdict}} Đáp án: {{q.label}} {{q.why}}
- `button` `data-tamoi-spark="completion"` — {{nextLabel}}
- `b` `data-tamoi-fx="reveal"` — {{tier.title}}

### thong-tin.html

- `h1` `data-tamoi-fx="split"` — Thông tin
- `button` `data-tamoi-card` `data-tamoi-fx="reveal"` `data-tamoi-spark="article"` — {{p.topic}} {{p.label}} {{p.title}} {{p.excerpt}} Đọc bài →
- `h2` `data-tamoi-fx="split"` `data-tamoi-fx-key="{{art.title}}"` — {{art.title}}
- `h3` `data-tamoi-fx="reveal"` `data-tamoi-fx-key="{{b.text}}"` — {{b.text}}
- `button` `data-tamoi-card` `data-tamoi-fx="reveal"` — {{r.title}}

### ve-du-an.html

- `h1` `data-tamoi-fx="reveal"` — GIẢI MÃ CHỮ “TẤM”
- `h2` `data-tamoi-fx="reveal"` — Món quen nhất, nhưng ít ai chắc chắn
- `p` `data-tamoi-fx="reveal"` — Cơm tấm là bữa ăn quen của sinh viên Sài Gòn: sau giờ học, gần trường, đi cùng bạn bè. Vậy mà khi được hỏi chữ “tấm” là gì, câu trả lời hay bắt đầu bằng “hình như…”.
- `h2` `data-tamoi-fx="split"` — Ngồi xuống nghe họ kể
- `button` `data-tamoi-spark="tab"` — {{p.name}} {{p.info}}
- `blockquote` `data-tamoi-fx="reveal"` `data-tamoi-fx-key="{{b.answer}}"` — “{{b.answer}}”
- `h2` `data-tamoi-fx="split"` — 5 giai đoạn sản xuất
- `h2` `data-tamoi-fx="split"` — Cơm tấm Ba Thiện
- `h2` `data-tamoi-fx="split"` — Cá Sấu Hoa Cà

## Lifecycle

One controller; WeakMap records suppress repeat initialization. Dynamic keys replay only changed content. Deferred font/animation callbacks verify the current record before running. Removed nodes cancel their animations. Split spans restore only when the original text still matches. Reduced motion cancels active motion and leaves content readable. CSS never hides content before JS initialization. stats() includes support, reduced motion, loaded modules, observer intersections and initialization counts.

## Evidence

See test-results/browser-results.json, test-results/interaction-results.json and screenshots. Browser tests use installed Chrome with real rendering. Localhost access was denied/timed out, so verification used file URLs. External Google Fonts may be unavailable in this environment; see captured request failures. Safari/iOS and physical touch hardware remain untested.
## Browser test results

- All six pages loaded all four effect modules and initialized their controller. Observer callbacks fired on every page; after scrolling, entrances completed with zero active animations, zero waiting nodes, and zero temporary word spans.
- Eight spark particles were measured after clicks on every page, including article opening and game actions that replace the clicked node. Serving the plate produced ten particles.
- Article details opened; anatomy selection changed to Sườn nướng; assembly reached its receipt and reset; all eight quiz questions reached the certificate and reset. Both original completion screens were captured.
- Fine mouse CTA magnet measured 10px. Touch emulation reported no fine pointer and no magnetic translate.
- Form typing preserved the entered value. Reduced motion and destroy cleaned up active effects, observer waiting nodes and bursts. With Web Animations unavailable, the anatomy heading remained opacity 1 and ingredient selection still worked.
- JavaScript errors: none. HTTP error responses: none in the file-URL test run. Google Fonts requests failed with ERR_NAME_NOT_RESOLVED; original font URLs were preserved. This environment did not permit localhost browser access. HTTP deployment behavior and original-font visual comparison remain unverified.

## Files changed

Six HTML pages; css/enhancements.css; js/animations/index.js, split-text.js, scroll-reveal.js, click-spark.js and magnet.js; this document. Added repeatable browser tests in tools/browser-test.cjs, tools/interaction-test.cjs and tools/lifecycle-test.cjs, with JSON reports and PNG evidence under test-results/. No runtime or gameplay code was changed.
