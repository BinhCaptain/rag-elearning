---
description: Khởi tạo toàn bộ môi trường và chạy ứng dụng từ đầu
---

# Quy trình cài đặt nhanh (Quick Setup Workflow)

Làm theo các bước sau để build và chạy dự án:

1. **Cài đặt dependencies**
   ```bash
   pnpm install
   ```

2. **Khởi động Docker Containers**
   // turbo
   ```bash
   docker-compose up -d
   ```

3. **Cấu hình Database**
   // turbo
   ```bash
   cd apps/api && pnpm exec prisma db push && pnpm exec prisma db seed
   ```

4. **Chạy ứng dụng**
   ```bash
   pnpm dev
   ```

---
*Lưu ý: Đảm bảo Docker Desktop đang chạy trước khi thực hiện bước 2.*
