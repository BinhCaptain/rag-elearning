# Kế hoạch Xây dựng Hệ thống E-learning tích hợp AI Chatbot
*(Đồng bộ giữa Đề cương Luận văn và Kế hoạch Kỹ thuật)*

Tài liệu này chia nhỏ quá trình xây dựng dự án thành các task chi tiết theo từng giai đoạn (Phase) tương ứng với timeline 14 tuần của luận văn, được gắn nhãn độ ưu tiên để thực hiện.

## 🎯 Phân loại mức độ ưu tiên
- **[P0] - Critical**: Nòng cốt hệ thống, bắt buộc phải làm trước để các module khác có thể chạy được (Database, Core API, Auth).
- **[P1] - High**: Các tính năng chính yếu được đề cập trong luận văn (RAG Pipeline, UI/UX cốt lõi, Quiz, Lesson).
- **[P2] - Medium**: Các tính năng bổ trợ tăng trải nghiệm (Progress Tracking nâng cao, Rule-based Recommendation, Admin Dashboard đầy đủ).
- **[P3] - Low**: Tối ưu hóa, Analytics, Deployment hoàn chỉnh phục vụ bảo vệ.

---

## 📅 Lộ trình & Chi tiết Task (Timeline 14 Tuần)

### Phase 1: Data Research & System Design (Tuần 1 - 2)
*Mục tiêu: Thu thập, làm sạch dữ liệu học tập (Grammar, Vocab) và thiết kế kiến trúc DB/API.*

- [ ] **Task 1.1 [P0]**: Phân tích Use Case & Functional Requirements cho 3 Actor (Student, Teacher, Admin).
- [ ] **Task 1.2 [P0]**: Thiết kế ERD (MySQL cho Core Data) và Schema cho MongoDB (Chat logs), Qdrant (Vector metadata).
- [ ] **Task 1.3 [P1]**: Thu thập & tiền xử lý dữ liệu tiếng Anh từ British Council, OpenStax, ESLflow (làm sạch text, định dạng markdown/JSON).
- [ ] **Task 1.4 [P1]**: Thiết kế REST API Contract & cấu hình Swagger Schema ban đầu.

### Phase 2: UI/UX Design & Setup Cơ sở (Tuần 3 - 5)
*Mục tiêu: Dựng wireframe, khởi tạo source code chuẩn monorepo.*

- [ ] **Task 2.1 [P0]**: Khởi tạo Monorepo (pnpm workspace) với cấu trúc `apps/web` (Next.js) và `apps/api` (NestJS).
- [ ] **Task 2.2 [P0]**: Setup môi trường local staging bằng Docker Compose (MySQL, MongoDB, Redis, Qdrant).
- [ ] **Task 2.3 [P1]**: Thiết kế Wireframe/UI Prototype cho Web App (Login, Dashboard, Course List, Lesson Detail, Chat Window).
- [ ] **Task 2.4 [P1]**: Setup các thư viện Frontend nền tảng (Tailwind CSS, shadcn/ui, Zustand, React Hook Form).

### Phase 3: Backend Development Core (Tuần 6 - 8)
*Mục tiêu: Xây dựng các module nghiệp vụ học tập cốt lõi (không bao gồm AI).*

- [ ] **Task 3.1 [P0]**: Phát triển User & Auth Module (JWT, Bcrypt hashing, Role-based access control).
- [ ] **Task 3.2 [P0]**: Phát triển Course & Lesson Module (Admin: CRUD; Student: View & Enroll).
- [ ] **Task 3.3 [P0]**: Phát triển Quiz Module (Tạo câu hỏi MCQ, xử lý nộp bài, auto-grading và lưu lịch sử điểm).
- [ ] **Task 3.4 [P1]**: Phát triển Learning Tracking Module (Lưu tiến độ bài học của User).
- [ ] **Task 3.5 [P2]**: Cấu hình quy tắc gợi ý học tập (Rule-based recommendation dựa trên điểm Quiz).

### Phase 4: AI & Chatbot Development (Tuần 9 - 11)
*Mục tiêu: Áp dụng RAG xây dựng trợ lý ảo hỗ trợ học viên.*

- [ ] **Task 4.1 [P0]**: Xây dựng Document Ingestion Pipeline (Parse tài liệu HTML/DOCX/PDF -> Chunking bằng tiktoken -> OpenAI Embeddings).
- [ ] **Task 4.2 [P0]**: Lưu trữ vector và metadata (level, topic, lesson_id) vào Qdrant.
- [ ] **Task 4.3 [P0]**: Phát triển Chatbot API (Nhận query -> Vector Search trong Qdrant -> Ghép prompt chuẩn xác -> Trả về OpenAI Chat Completion).
- [ ] **Task 4.4 [P1]**: Cấu hình lưu trữ lịch sử hội thoại (MongoDB) và Guardrails cơ bản cho AI.
- [ ] **Task 4.5 [P1]**: Tích hợp UI Chatbot vào Frontend của học sinh (Pop-up hoặc panel trong trang Lesson).

### Phase 5: Testing, Optimization & Admin (Tuần 12 - 13)
*Mục tiêu: Đảm bảo phần mềm chạy ổn định, chính xác.*

- [ ] **Task 5.1 [P1]**: Xây dựng UI Admin Dashboard (Quản lý users, review khóa học, upload file dữ liệu RAG).
- [ ] **Task 5.2 [P1]**: Viết Unit Test & Integration Test (Jest/Supertest) cho các luồng Core (Auth, Quiz, RAG Retrieve).
- [ ] **Task 5.3 [P2]**: Tối ưu tốc độ Backend & Cache (Redis) cho các API truy xuất courses/lessons.
- [ ] **Task 5.4 [P2]**: Optimize retrieval strategy & Prompt để giảm thiểu Hallucination của Chatbot.

### Phase 6: Documentation & Final Review (Tuần 14)
*Mục tiêu: Hoàn thiện dữ liệu thực tế và chuẩn bị báo cáo luận văn.*

- [ ] **Task 6.1 [P1]**: Chuẩn bị Seed Data giả lập (Khóa học mẫu, dummy users, bài test test-case).
- [ ] **Task 6.2 [P2]**: Deploy Front-end (Vercel) & Back-end lên môi trường Cloud (render/VPS) lấy link Demo.
- [ ] **Task 6.3 [P0]**: Screenshot hệ thống, xuất ERD, Architecture diagram thực tế từ mã nguồn.
- [ ] **Task 6.4 [P0]**: Đóng gói source code, viết file README hoàn chỉnh.
