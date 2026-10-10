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
- `js/restaurant-service.js`: kiểm tra dữ liệu và adapter demo.
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

Mở `http://127.0.0.1:8000/index.html`. Có thể mở file HTML trực tiếp, nhưng nên dùng HTTP để kiểm tra đường dẫn và localStorage giống môi trường triển khai. Không cần `npm install`.

## Runtime và chỉnh nội dung

Mỗi trang chứa `<template id="tpl">` và `class Component extends DCLogic`. `renderVals()` trả về dữ liệu cùng hàm sự kiện. `setState()` gom cập nhật vào microtask; runtime dựng cây tạm và patch DOM theo vị trí. Biến `{{ten}}`, `<sc-for list="{{items}}" as="item">` và `<sc-if value="{{visible}}">` được hỗ trợ. Nội dung text dùng text node, không được diễn giải thành HTML. Hàm sự kiện cần được truyền bằng biến; không đặt JavaScript inline dạng chuỗi.

Runtime chưa hỗ trợ keyed reconciliation, lifecycle unmount tự động hoặc router. Giữ thứ tự node ổn định; không tự ý sửa engine. Text/input có `value` lấy từ state và handler input cập nhật state. Các trường không điều khiển như biệt danh/checkbox giữ DOM trong lúc form còn hiện. Khi thêm điều kiện hoặc đổi cấu trúc danh sách, cần kiểm tra focus, selection và việc chạy lại animation.

Sửa chữ/layout tại template, dữ liệu tại `renderVals()`. Thay ảnh bằng đường dẫn tương đối trong `assets/`; giữ alt mô tả cho ảnh có ý nghĩa và alt rỗng cho ảnh trang trí. Không thay tên ảnh gốc có cache immutable nếu thay nội dung: dùng tên mới.

Thêm bài: thêm vào mảng `all` của `thong-tin.html`, dùng helper H/P/Q/N. Cập nhật giới hạn trong `articleFromHash()` khi thay số bài. Giữ nhãn nguồn và giai thoại; lời kể Ba Thiện vẫn là bản nháp chờ xác nhận.

Sửa trò chơi: mảng `list` và logic phân loại trong `rap-dia.html`; mảng `qs` và đáp án `t/f/g` trong trang quiz. Không đổi luật mà không ghi rõ. Ráp dĩa dùng nút bấm, không dùng kéo thả. Timer chan mắm bị huỷ khi quay lại/reset.

## Form và dữ liệu

Hiện chỉ có **demo trên cùng trình duyệt**. Key localStorage: `tamoi.submissions.v1`. Không gửi mạng, không có database chung, nhóm dự án chưa nhận dữ liệu. Bản demo xuất hiện trên bản đồ cá nhân, được gắn nhãn rõ ràng. Xoá key này trong DevTools để xoá dữ liệu demo.

Tên quán, khu vực, câu chuyện và checkbox đồng ý đều bắt buộc. Service kiểm tra độ dài, khu vực và trùng tên/khu vực; giới hạn 100 bản demo. Form chặn gửi lặp, chỉ xoá dữ liệu sau khi lưu thành công, giữ nội dung khi lỗi lưu. User text được render bằng runtime text node, không chèn HTML.

Để có backend: thay adapter trong `restaurant-service.js` bằng API và chuyển retrieval sang async nếu cần; tách các bài gửi cá nhân khỏi danh sách công khai. Server phải kiểm tra dữ liệu, chống spam, lưu trạng thái pending, kiểm duyệt trước khi trả trong danh sách công khai. Chỉ báo thành công sau khi server chấp nhận. Đồng thời cập nhật nhãn demo/success UI cho đúng backend. Không đặt khoá đặc quyền trong browser. Chưa có API hay khoá nào được cấu hình.

## Video

Điền URL HTTPS thật vào `window.TamOiConfig.media` trong `js/site-config.js`: `film`, `trailer`, `behindScenes`. YouTube watch URL hoặc youtu.be với ID 11 ký tự sẽ nhúng YouTube privacy-enhanced khi người dùng bấm. TikTok mở liên kết chính thức; không có player giả. Để trống sẽ mở thông báo chờ phát hành, giữ poster và animation gốc. URL không thuộc domain được hỗ trợ không được mở.

## Triển khai và giới hạn

Xem `DEPLOYMENT.md` cho GitHub/Vercel. Chưa triển khai lên tài khoản Vercel; cần repository/tài khoản đích. Chưa có domain công khai nên không bịa canonical, og:url hay sitemap. Khi chốt domain, chạy công cụ sitemap và điền metadata URL tuyệt đối. Font Google Fonts cần mạng; chưa đóng gói font offline.

Website render nội dung bằng JavaScript nên khả năng index phụ thuộc crawler chạy JS. Noscript báo rõ yêu cầu JavaScript. Header phụ giữ liên kết về trang chủ/góc trò chơi, footer giữ thiết kế gốc; không thêm bộ navigation/footer mới làm thay đổi layout. Menu thu gọn chỉ bổ sung trên hai header vốn có thanh navigation, dưới 768px.

Kiểm tra chi tiết, khác biệt đã biết và bằng chứng bảo toàn: `TESTING.md`.

## Animation bổ sung

Hiệu ứng native lấy cảm hứng từ React Bits được tách khỏi runtime và giữ nguyên design/game logic. Xem [ANIMATIONS.md](ANIMATIONS.md) cho vị trí effect, cách tắt, lifecycle, reduced motion và dependency; xem phần bổ sung trong TESTING.md cho before/after regression và test interactions. Không cần cài thêm package hay build khi deploy.
