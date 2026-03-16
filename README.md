# Hướng dẫn Cài đặt và Chạy Dự án (Setup & Run Guide)

Tài liệu này hướng dẫn cách thiết lập môi trường và chạy toàn bộ hệ thống E-learning AI Chatbot từ đầu trên một máy tính mới.

## 1. Yêu cầu hệ thống (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính đã cài đặt:
- **Node.js** (v18 trở lên)
- **pnpm** (`npm install -g pnpm`)
- **Docker & Docker Compose** (Để chạy MySQL, MongoDB, Redis, Qdrant)
- **Git**

## 2. Cài đặt môi trường (Environment Setup)

1. **Clone dự án:**
   ```bash
   git clone <repository-url>
   cd elearning-ai
   ```

2. **Cài đặt dependencies:**
   ```bash
   pnpm install
   ```

3. **Cấu hình biến môi trường (.env):**
   - Copy file `.env.example` thành `.env` ở thư mục gốc (nếu có) và trong `apps/api/.env`.
   - Đảm bảo `DATABASE_URL` trỏ đúng vào port `3307` (như cấu hình Docker).
   - Ví dụ `apps/api/.env`:
     ```env
     DATABASE_URL="mysql://root:root@localhost:3307/elearning"
     JWT_SECRET="your_super_secret_key"
     ```

## 3. Khởi chạy các dịch vụ (Running Services)

1. **Khởi động Middleware (Docker):**
   ```bash
   docker-compose up -d
   ```
   *Lệnh này sẽ chạy MySQL (port 3307), MongoDB, Redis và Qdrant trong nền.*

2. **Khởi tạo Database (Prisma):**
   ```bash
   cd apps/api
   pnpm exec prisma db push
   pnpm exec prisma db seed
   ```
   *Lệnh này sẽ tạo bảng và nạp dữ liệu mẫu (Khóa học, Bài học, Quiz).*

3. **Chạy toàn bộ App (Monorepo):**
   Quay lại thư mục gốc dự án và chạy:
   ```bash
   pnpm dev
   ```

## 4. Truy cập hệ thống

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
- **Tài khoản dùng thử:**
  - **Email:** `user1@example.com`
  - **Password:** `user1`

## 5. Các lệnh hữu ích

- `pnpm build`: Build dự án cho production.
- `pnpm lint`: Kiểm tra lỗi code.
- `pnpm exec prisma studio`: Mở giao diện xem database (trong thư mục `apps/api`).

---
**Lưu ý:** Nếu port 3307 bị chiếm, hãy thay đổi trong `docker-compose.yml` và cập nhật lại `DATABASE_URL` trong `.env`.
