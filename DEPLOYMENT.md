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

3. Trong Vercel, Add New Project → import repository. Root Directory là thư mục chứa `index.html`. Framework Preset: **Other**. Bật override Build Command và để trống (không có build); Output Directory: `.`. Không cần Install Command hoặc biến môi trường cho demo. Nếu đưa cả outputs vào repo cha, chọn Root Directory đúng là `outputs/tamoi-website`.
4. Deploy. Sáu URL `.html` được phục vụ riêng; không dùng rewrite tất cả về index. Kiểm tra cả sáu trang, asset requests, form demo, quiz, ráp dĩa và Back/Forward tại URL Vercel thật.
5. Kết nối domain khi đã có. Điền canonical/og:url và og:image tuyệt đối vào mỗi trang. Chạy:

```powershell
node tools/sitemap.cjs https://YOUR-REAL-DOMAIN
```

Công cụ ghi sitemap.xml và thêm URL sitemap vào robots.txt. Không dùng domain ví dụ này trong bản public.
6. Các commit mới trên production branch của repo được Vercel triển khai qua Git integration. Kiểm tra Preview Deployment trước khi đưa thay đổi lớn lên production.

`vercel.json` thêm nosniff, Referrer-Policy, cache dài cho ảnh tên hash, cache revalidate cho JS. Không có backend/server, framework hoặc SPA rewrite. Cần domain, tài khoản/repository đích, video thật và xác nhận lời kể Ba Thiện. Nếu cần dữ liệu chia sẻ, cần API với validation/moderation phía server.

Tài liệu tham chiếu: [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build), [Vercel static configuration](https://vercel.com/docs/project-configuration/vercel-json), [GitHub: thêm mã nguồn có sẵn](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github).
