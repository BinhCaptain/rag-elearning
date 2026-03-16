# Build Plan Web E-learning AI Chatbot

## 1. Mục tiêu dự án
Xây dựng một hệ thống E-learning tích hợp AI Chatbot hỗ trợ học tiếng Anh cho học sinh THCS, gồm các chức năng chính:
- Quản lý người dùng: Student, Teacher, Admin
- Quản lý khóa học, bài học, quiz
- Theo dõi tiến độ học tập
- AI Chatbot hỗ trợ hỏi đáp theo nội dung bài học
- Hệ thống RAG để truy xuất tri thức từ tài liệu học tập

---

## 2. Tech Stack đề xuất

### Frontend
- **Ngôn ngữ:** TypeScript
- **Framework:** Next.js
- **UI:** Tailwind CSS
- **Component library:** shadcn/ui
- **Form handling:** React Hook Form + Zod
- **State management:** Zustand
- **Chart / Dashboard:** Recharts

### Backend
- **Ngôn ngữ:** TypeScript
- **Runtime:** Node.js
- **Framework:** NestJS
- **Authentication:** JWT + Refresh Token
- **Validation:** class-validator, class-transformer
- **API Documentation:** Swagger
- **Queue / Background Jobs:** BullMQ + Redis

### Database
- **Relational DB:** MySQL
- **ORM:** Prisma
- **NoSQL:** MongoDB
- **Cache / Queue:** Redis
- **Vector Database:** Qdrant

### AI / RAG
- **LLM API:** OpenAI Responses API
- **Embeddings:** OpenAI Embeddings
- **Document parsing:** pdf-parse, mammoth
- **Chunking / token support:** tiktoken
- **Optional orchestration:** LangChain

---

## 3. Ngôn ngữ và thư viện cần học

## 3.1 Frontend
### Cần học
- HTML, CSS, JavaScript
- TypeScript
- React
- Next.js

### Thư viện nên dùng
- `next`
- `react`
- `tailwindcss`
- `shadcn/ui`
- `react-hook-form`
- `zod`
- `zustand`
- `axios`
- `recharts`

---

## 3.2 Backend
### Cần học
- Node.js
- TypeScript nâng cao
- REST API
- NestJS
- JWT Authentication
- Prisma ORM

### Thư viện nên dùng
- `@nestjs/common`
- `@nestjs/core`
- `@nestjs/config`
- `@nestjs/jwt`
- `@nestjs/passport`
- `passport`
- `passport-jwt`
- `class-validator`
- `class-transformer`
- `@nestjs/swagger`
- `prisma`
- `@prisma/client`
- `bcrypt`
- `bullmq`
- `ioredis`
- `multer`

---

## 3.3 AI / RAG
### Cần học
- Embedding
- Vector Search
- Chunking Documents
- Prompt Engineering
- RAG Pipeline
- Guardrails cơ bản

### Thư viện nên dùng
- `openai`
- `@qdrant/js-client-rest`
- `pdf-parse`
- `mammoth`
- `tiktoken`
- `langchain` (nếu cần)

---

## 4. Kiến trúc hệ thống

## 4.1 Thành phần chính
- **Frontend Web App:** Next.js
- **Backend API:** NestJS
- **MySQL:** lưu dữ liệu nghiệp vụ
- **MongoDB:** lưu chat logs, interaction history
- **Qdrant:** lưu vector embeddings
- **Redis:** cache, queue
- **Object Storage:** lưu tài liệu, ảnh, file học tập

## 4.2 Các module backend
1. Auth Module
2. User Module
3. Course Module
4. Lesson Module
5. Quiz Module
6. Progress Module
7. Recommendation Module
8. Chatbot Module
9. Document Ingestion Module
10. Admin Module
11. Analytics Module

---

## 5. Cấu trúc thư mục gợi ý

```txt
elearning-ai/
├─ apps/
│  ├─ web/
│  └─ api/
├─ packages/
│  ├─ ui/
│  ├─ types/
│  └─ config/
├─ docs/
│  ├─ erd/
│  ├─ api-spec/
│  └─ thesis-assets/
├─ infrastructure/
│  ├─ docker/
│  └─ scripts/
└─ README.md
```

---

## 6. Database schema sơ bộ

## 6.1 MySQL
- users
- roles
- student_profiles
- teacher_profiles
- courses
- sections
- lessons
- quizzes
- questions
- options
- attempts
- progress
- recommendations

## 6.2 MongoDB
- chat_sessions
- chat_messages
- ai_logs
- retrieval_logs
- user_feedback

## 6.3 Qdrant metadata
- document_id
- course_id
- lesson_id
- level
- topic
- source
- chunk_text

---

## 7. Build Plan step by step

## Phase 0 — Xác định phạm vi MVP
### Mục tiêu
Chốt phạm vi đủ để demo, tránh làm quá rộng.

### Việc cần làm
- Xác định actor:
  - Student
  - Teacher
  - Admin
- Chốt chức năng MVP:
  - đăng ký / đăng nhập
  - học lesson
  - làm quiz
  - xem progress
  - chat với AI theo bài học
- Chốt future scope:
  - gamification
  - speaking assessment
  - pronunciation scoring
  - parent portal

### Deliverables
- Feature list
- User flow
- Sitemap
- Use case list

---

## Phase 1 — Thiết kế dữ liệu và API
### Mục tiêu
Thiết kế nền tảng dữ liệu trước khi code.

### Việc cần làm
1. Vẽ ERD
2. Viết Prisma schema
3. Thiết kế REST API
4. Tạo Swagger spec
5. Chuẩn bị dữ liệu mẫu

### Deliverables
- ERD
- Prisma schema
- API contract
- Seed data

---

## Phase 2 — Setup project structure
### Mục tiêu
Khởi tạo codebase chuẩn, dễ mở rộng.

### Việc cần làm
- Tạo monorepo bằng pnpm workspace hoặc turborepo
- Khởi tạo:
  - `apps/web`
  - `apps/api`
  - `packages/ui`
  - `packages/types`
- Setup ESLint, Prettier, tsconfig chung
- Setup Docker Compose cho local environment

### Deliverables
- Monorepo structure
- Base config
- Docker environment

---

## Phase 3 — Xây Auth và User Management
### Mục tiêu
Hoàn thiện đăng nhập và phân quyền.

### Việc cần làm
- Register
- Login
- Logout
- Refresh token
- Role-based access control
- Profile management
- Password hashing bằng bcrypt

### Deliverables
- Auth API
- User profile API
- Login/Register UI

---

## Phase 4 — Xây Course và Lesson Module
### Mục tiêu
Cho phép quản lý và hiển thị khóa học.

### Việc cần làm
- Admin tạo / sửa / xóa course
- Admin tạo lesson
- Gắn tài liệu, grammar, vocabulary vào lesson
- Publish / unpublish lesson
- Student xem danh sách course
- Student xem lesson detail

### Deliverables
- Course CRUD API
- Lesson CRUD API
- Course pages
- Lesson pages

---

## Phase 5 — Xây Quiz Module
### Mục tiêu
Cho học sinh làm bài và hệ thống chấm điểm tự động.

### Việc cần làm
- Tạo quiz
- Tạo question
- Tạo answer options
- Nộp bài
- Auto grading
- Lưu lịch sử điểm
- Hiển thị giải thích đáp án

### Deliverables
- Quiz API
- Quiz UI
- Score history

---

## Phase 6 — Xây Progress Tracking
### Mục tiêu
Theo dõi tiến độ học tập.

### Việc cần làm
- Lưu lesson completed
- Lưu score history
- Tính progress theo course
- Phát hiện topic yếu
- Gợi ý next lesson theo rule-based logic

### Rule đề xuất
- `< 60%`: học lại bài cũ
- `60% - 80%`: học tiếp và luyện thêm
- `> 80%`: mở bài tiếp theo

### Deliverables
- Progress API
- Dashboard progress
- Recommendation rules

---

## Phase 7 — Xây Document Ingestion cho RAG
### Mục tiêu
Biến tài liệu học thành tri thức truy xuất được.

### Việc cần làm
1. Thu thập tài liệu:
   - grammar notes
   - vocabulary materials
   - lesson content
   - quiz explanation
2. Parse tài liệu:
   - PDF
   - DOCX
   - HTML
3. Làm sạch text
4. Chunk document
5. Embedding
6. Lưu vector vào Qdrant
7. Lưu metadata để filter theo lesson, topic, level

### Deliverables
- Document parser service
- Chunking service
- Embedding service
- Vector indexing pipeline

---

## Phase 8 — Xây Chatbot Module
### Mục tiêu
Cho phép user hỏi đáp với AI dựa trên nội dung bài học.

### Luồng xử lý
1. User gửi câu hỏi
2. Backend xác thực user
3. Tải learner context
4. Retrieve top-k chunks từ Qdrant
5. Ghép prompt
6. Gọi OpenAI Responses API
7. Lưu log hội thoại
8. Trả câu trả lời và nguồn tham chiếu

### Tính năng chatbot
- giải thích ngữ pháp
- giải thích từ vựng
- trả lời theo lesson
- gợi ý bài học liên quan
- fallback khi không đủ dữ liệu

### Deliverables
- Chat API
- Chat UI
- Retrieval logging
- Basic guardrails

---

## Phase 9 — Xây Admin Dashboard
### Mục tiêu
Quản lý toàn bộ hệ thống từ phía quản trị.

### Chức năng
- Quản lý users
- Quản lý courses
- Quản lý lessons
- Quản lý quizzes
- Upload tài liệu cho RAG
- Xem chatbot logs
- Xem analytics cơ bản

### Deliverables
- Admin dashboard
- CRUD pages
- Upload document page
- Analytics overview

---

## Phase 10 — Testing
### Mục tiêu
Đảm bảo hệ thống hoạt động ổn định.

### Cần test
- Unit test backend
- Integration test API
- UI test cơ bản
- Chatbot evaluation nhỏ
- Auth & role-based access test

### Thư viện đề xuất
- Jest
- Supertest
- Playwright

### Deliverables
- Test cases
- Test scripts
- Bug fix log

---

## Phase 11 — Deployment
### Mục tiêu
Đưa hệ thống lên môi trường demo.

### Môi trường local
- Docker Compose:
  - web
  - api
  - mysql
  - mongodb
  - redis
  - qdrant

### Môi trường production/demo
- Frontend: Vercel hoặc VPS
- Backend: VPS / Render / Railway
- MySQL: managed hoặc self-host
- MongoDB: Atlas hoặc self-host
- Qdrant: Docker container
- Redis: Docker container

### Deliverables
- Deployment guide
- `.env.example`
- Docker Compose
- Production demo link

---

## 8. Lộ trình học và code

## Giai đoạn 1 — Nền tảng
1. HTML/CSS/JavaScript
2. TypeScript
3. React
4. Next.js
5. SQL/MySQL
6. Git/GitHub
7. Docker cơ bản

## Giai đoạn 2 — Backend
8. Node.js
9. NestJS
10. Prisma
11. JWT Auth
12. Swagger
13. Redis + Queue

## Giai đoạn 3 — AI
14. Embeddings
15. Vector Database
16. Qdrant
17. Chunking
18. Prompt Engineering
19. RAG pipeline
20. OpenAI Responses API

---

## 9. MVP nên làm trước

### Student
- Register / Login
- Xem course
- Học lesson
- Làm quiz
- Xem progress
- Chat với AI theo lesson

### Admin
- Quản lý course
- Quản lý lesson
- Quản lý quiz
- Upload tài liệu RAG

### AI
- Hỏi đáp theo lesson
- Trả lời có context
- Gợi ý học tiếp theo rule-based logic

---

## 10. Timeline 14 tuần

### Tuần 1–2
- Phân tích yêu cầu
- Vẽ use case
- Thiết kế ERD
- Thiết kế API

### Tuần 3–4
- Setup monorepo
- Setup Next.js + NestJS
- Setup MySQL + MongoDB + Redis + Qdrant
- Xây auth skeleton

### Tuần 5
- Hoàn thiện login/register
- Phân quyền role
- Tạo dashboard cơ bản

### Tuần 6–7
- Xây course/lesson module
- Admin CRUD
- Student lesson pages

### Tuần 8
- Xây quiz module
- Chấm điểm tự động
- Lưu score history

### Tuần 9
- Xây progress tracking
- Recommendation rules
- Dashboard tiến độ

### Tuần 10
- Xây document ingestion pipeline
- Parse, chunk, embed, index

### Tuần 11
- Xây chatbot API
- Kết nối retrieval
- Xây chat UI

### Tuần 12
- Test end-to-end
- Logging
- Security hardening cơ bản

### Tuần 13
- Tối ưu UX
- Tune retrieval
- Tune prompt
- Chuẩn bị dataset demo

### Tuần 14
- Hoàn thiện báo cáo
- Chụp hình hệ thống
- Vẽ architecture diagram
- Chuẩn bị slide bảo vệ

---

## 11. Kết luận

Stack phù hợp nhất cho đề tài này:
- **Frontend:** Next.js + TypeScript + Tailwind CSS
- **Backend:** NestJS + TypeScript
- **Database:** MySQL + Prisma + MongoDB
- **Vector DB:** Qdrant
- **AI:** OpenAI Responses API + Embeddings + RAG

Đây là lựa chọn cân bằng giữa:
- dễ phát triển
- dễ demo
- phù hợp phạm vi luận văn
- dễ mở rộng sau này
