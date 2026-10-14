# TẤM ƠI! — website tĩnh

Sáu trang HTML, CSS và JavaScript thuần. Không cần React, thư viện giao diện hay bước build. Giữ nguyên bộ chạy `js/tamoi-runtime.js`, 37 ảnh WebP, các keyframe, hiệu ứng hover và luật chơi từ bản gốc.

## Cấu trúc

- `index.html`: trang chủ, gọi Tấm, quán quen, form và khu phim.
- `ve-du-an.html`: dự án và phỏng vấn Gen Z.
- `thong-tin.html`: tám bài viết; URL `#bai-1` đến `#bai-8` hỗ trợ tải lại và Back/Forward.
- `giai-phau-dia-com.html`: bảy thành phần.
- `rap-dia.html`: chọn món bằng nút, chan mắm, phiếu gọi món.
- `that-hay-giai-thoai.html`: tám câu hỏi và điểm cuối.
- `js/tamoi-runtime.js`: runtime gốc.
- `js/restaurant-service.js`: validation, gửi Supabase và đọc quán đã duyệt.
- `js/supabase-client.js`, `js/supabase-config.js`: official SDK client và cấu hình công khai.
- `js/vendor/`: official Supabase SDK đã pin, license và checksum.
- `supabase/migrations/`: schema, constraints, RLS và column grants.
- `js/site-config.js`: cấu hình video công khai.
- `js/site-enhancements.js`: menu di động và hộp thông tin video.
- `css/production.css`: bổ sung tương thích màn hình nhỏ và focus.
- `assets/`: toàn bộ ảnh gốc.
- `vercel.json`, `robots.txt`, `.gitignore`: cấu hình triển khai.

## Chạy trên máy

Cài Node.js nếu muốn dùng server mẫu không phụ thuộc thư viện:

```powershell
node tools/serve.cjs
```

Mở `http://127.0.0.1:8000/index.html`. Có thể mở file HTML trực tiếp, nhưng nên dùng HTTP để kiểm tra đường dẫn và kết nối Supabase giống môi trường triển khai. Không cần `npm install`.

## Runtime và chỉnh nội dung

Mỗi trang chứa `<template id="tpl">` và `class Component extends DCLogic`. `renderVals()` trả về dữ liệu cùng hàm sự kiện. `setState()` gom cập nhật vào microtask; runtime dựng cây tạm và patch DOM theo vị trí. Biến `{{ten}}`, `<sc-for list="{{items}}" as="item">` và `<sc-if value="{{visible}}">` được hỗ trợ. Nội dung text dùng text node, không được diễn giải thành HTML. Hàm sự kiện cần được truyền bằng biến; không đặt JavaScript inline dạng chuỗi.

Runtime chưa hỗ trợ keyed reconciliation, lifecycle unmount tự động hoặc router. Giữ thứ tự node ổn định; không tự ý sửa engine. Text/input có `value` lấy từ state và handler input cập nhật state. Các trường không điều khiển như biệt danh/checkbox giữ DOM trong lúc form còn hiện. Khi thêm điều kiện hoặc đổi cấu trúc danh sách, cần kiểm tra focus, selection và việc chạy lại animation.

Sửa chữ/layout tại template, dữ liệu tại `renderVals()`. Thay ảnh bằng đường dẫn tương đối trong `assets/`; giữ alt mô tả cho ảnh có ý nghĩa và alt rỗng cho ảnh trang trí. Không thay tên ảnh gốc có cache immutable nếu thay nội dung: dùng tên mới.

Thêm bài: thêm vào mảng `all` của `thong-tin.html`, dùng helper H/P/Q/N. Cập nhật giới hạn trong `articleFromHash()` khi thay số bài. Giữ nhãn nguồn và giai thoại; lời kể Ba Thiện vẫn là bản nháp chờ xác nhận.

Sửa trò chơi: mảng `list` và logic phân loại trong `rap-dia.html`; mảng `qs` và đáp án `t/f/g` trong trang quiz. Không đổi luật mà không ghi rõ. Ráp dĩa dùng nút bấm, không dùng kéo thả. Timer chan mắm bị huỷ khi quay lại/reset.

## Form và dữ liệu

Supabase là nguồn dữ liệu duy nhất cho bài gửi: **gửi → pending → admin duyệt → bản đồ công khai**. Không đọc/ghi localStorage và không giả báo thành công khi database lỗi. Sáu quán có sẵn vẫn được giữ; bài đã duyệt được gộp và lọc theo khu vực. Trùng tên/khu vực được bỏ khỏi danh sách hiển thị, ưu tiên quán seed có địa chỉ đã cung cấp.

Tên quán 1–120 ký tự, câu chuyện 1–2000, khu vực hợp lệ và consent là bắt buộc; nickname tối đa 80, không bắt buộc và không công khai. Form chỉ reset khi database xác nhận INSERT; lỗi giữ nội dung, nickname và checkbox. Pending/rejected không được public SELECT. Bài gửi không có địa chỉ xác minh dùng tìm kiếm Maps theo tên và khu vực, không bịa địa chỉ. Runtime render bằng text node; không chèn HTML từ người dùng.

**Cần chạy migration thủ công:** project URL/key công khai đã được cấu hình theo thông tin bạn cung cấp. Read-only preflight ngày 14/10/2026 trả PGRST205 (table chưa có trong schema cache); chưa ghi dữ liệu vào project. Chạy toàn bộ `supabase/migrations/202610140001_restaurant_submissions.sql` trong Supabase SQL Editor. Xem [SUPABASE.md](SUPABASE.md) cho cấu hình, RLS, moderation, kiểm thử live và chống spam. Không deploy tự động.

## Video

Điền URL HTTPS thật vào `window.TamOiConfig.media` trong `js/site-config.js`: `film`, `trailer`, `behindScenes`. YouTube watch URL hoặc youtu.be với ID 11 ký tự sẽ nhúng YouTube privacy-enhanced khi người dùng bấm. TikTok mở liên kết chính thức; không có player giả. Để trống sẽ mở thông báo chờ phát hành, giữ poster và animation gốc. URL không thuộc domain được hỗ trợ không được mở.

## Triển khai và giới hạn

Xem `DEPLOYMENT.md` cho GitHub/Vercel. Chưa triển khai lên tài khoản Vercel; cần repository/tài khoản đích. Chưa có domain công khai nên không bịa canonical, og:url hay sitemap. Khi chốt domain, chạy công cụ sitemap và điền metadata URL tuyệt đối. Font Google Fonts cần mạng; chưa đóng gói font offline.

Website render nội dung bằng JavaScript nên khả năng index phụ thuộc crawler chạy JS. Noscript báo rõ yêu cầu JavaScript. Header phụ giữ liên kết về trang chủ/góc trò chơi, footer giữ thiết kế gốc; không thêm bộ navigation/footer mới làm thay đổi layout. Menu thu gọn chỉ bổ sung trên hai header vốn có thanh navigation, dưới 768px.

Kiểm tra chi tiết, khác biệt đã biết và bằng chứng bảo toàn: `TESTING.md`.

## Animation bổ sung

Hiệu ứng native lấy cảm hứng từ React Bits được tách khỏi runtime và giữ nguyên design/game logic. Xem [ANIMATIONS.md](ANIMATIONS.md) cho vị trí effect, cách tắt, lifecycle, reduced motion và dependency; xem phần bổ sung trong TESTING.md cho before/after regression và test interactions. Không cần cài thêm package hay build khi deploy.
