# GitHub và Vercel

1. Tạo repository GitHub trống trong tài khoản của bạn. Không đưa khoá bí mật vào repo.
2. Mở terminal tại thư mục chứa `index.html` và chạy:

```powershell
git init -b main
git add .
git commit -m "Prepare Tam Oi static website"
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
```

Thay OWNER/REPOSITORY bằng repo thật. Đăng nhập GitHub theo hướng dẫn của Git khi cần.

3. Trong Vercel, Add New Project → import repository. Root Directory là thư mục chứa `index.html`. Framework Preset: **Other**. Bật override Build Command và để trống (không có build); Output Directory: `.`. Không cần Install Command. Supabase SDK đã self-host; public config có trong js/supabase-config.js. Nếu dùng biến môi trường, cần Build Command node tools/configure-supabase.cjs; biến Vercel không tự xuất hiện trong browser. Nếu đưa cả outputs vào repo cha, chọn Root Directory đúng là `outputs/tamoi-website`.
4. Deploy. Sáu URL `.html` được phục vụ riêng; không dùng rewrite tất cả về index. Kiểm tra cả sáu trang, asset requests, form Supabase (sau migration), quiz, ráp dĩa và Back/Forward tại URL Vercel thật.
5. Kết nối domain khi đã có. Điền canonical/og:url và og:image tuyệt đối vào mỗi trang. Chạy:

```powershell
node tools/sitemap.cjs https://YOUR-REAL-DOMAIN
```

Công cụ ghi sitemap.xml và thêm URL sitemap vào robots.txt. Không dùng domain ví dụ này trong bản public.
6. Các commit mới trên production branch của repo được Vercel triển khai qua Git integration. Kiểm tra Preview Deployment trước khi đưa thay đổi lớn lên production.

`vercel.json` thêm nosniff, Referrer-Policy, cache dài cho ảnh tên hash, cache revalidate cho JS. Không có backend/server, framework hoặc SPA rewrite. Cần domain, tài khoản/repository đích, video thật và xác nhận lời kể Ba Thiện. Supabase cung cấp database chung; phải chạy migration và kiểm tra RLS trước khi nhận bài gửi.

Tài liệu tham chiếu: [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build), [Vercel static configuration](https://vercel.com/docs/project-configuration/vercel-json), [GitHub: thêm mã nguồn có sẵn](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github).

## Supabase và cấu hình public

1. Chạy toàn bộ migration trong SQL Editor; không tự deploy hay sửa database từ agent. Backup/audit bảng hiện có trước. Migration transactional, không xóa records; schema không tương thích sẽ rollback.
2. Không-build: edit `js/supabase-config.js` với origin URL và `sb_publishable_…`. Cấu hình hiện đã dùng project bạn cung cấp. Key này public; tuyệt đối không dùng secret/service_role/database password.
3. Tùy chọn Vercel environment: đặt `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` cho từng Preview/Production environment, Build Command `node tools/configure-supabase.cjs`, Output Directory `.`. Generator chỉ ghi hai public values; không đưa env khác vào bundle. Env trong Vercel không tự trở thành biến JS.
4. Local PowerShell: đặt hai biến `$env:SUPABASE_URL`, `$env:SUPABASE_PUBLISHABLE_KEY`, chạy generator rồi `node tools/serve.cjs`. Script không tự đọc .env; .env.example chỉ là mẫu.
5. Sau migration, dùng Preview Deployment để kiểm tra gửi pending → duyệt trong Dashboard → reload thấy approved; thử lỗi, lọc khu vực và cả sáu trang trước khi deploy production. Chưa có deployment mới từ đợt tích hợp này.

Chi tiết grants, moderation và security test ở [SUPABASE.md](SUPABASE.md). Không sửa CSS, runtime, animations hoặc game logic để cấu hình database.
## GA4 deployment checklist — 15/10/2026

- GA4 ID is `G-B51G96ZP8R`, shared in `js/analytics.js`; all six HTML heads load the module once. No Vercel environment variables, build step, new package or Vercel configuration change are required for Analytics.
- Before publishing, a GA4 administrator must disable **Enhanced Measurement**, including form/outbound link/history measurement. Those automatic features can otherwise leak user-generated Maps query text or duplicate page views. Keep advertising personalization, Signals and user-provided data collection disabled. Review other account-side Google destinations/rules.
- Publish only when authorized through the existing GitHub/Vercel flow. This integration has not been deployed automatically.
- On the actual URL, use Tag Assistant and GA4 Realtime/DebugView to verify opt-in, all six page views, custom events and withdrawal. Before opt-in/after refusal there should be no Google tag load or analytics collection. Test Supabase failure and confirmed insertion independently.
- Source/local Chrome tests passed; official tag URL returned HTTP 200. Actual GA4 receipt, account configuration and production browser behavior remain unverified. Instructions and exact event schema: [ANALYTICS.md](ANALYTICS.md). Privacy notice: [PRIVACY.md](PRIVACY.md), also displayed inline in consent details.
