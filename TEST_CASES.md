# 🧪 BỘ TEST CASES TOÀN DIỆN — RAG E-LEARNING SYSTEM

> **Phiên bản:** 1.0  
> **Ngày tạo:** 24/06/2026  
> **Môi trường kiểm thử:** Local (http://localhost:3000 / http://localhost:3001)

---

## 📋 MỤC LỤC

- [PHẦN A: KIỂM THỬ CHỨC NĂNG (Functional Testing)](#phần-a)
- [PHẦN B: KIỂM THỬ BẢO MẬT (Security Testing)](#phần-b)
- [PHẦN C: KIỂM THỬ HỆ THỐNG (System Testing)](#phần-c)
- [Hướng dẫn chạy Test nhanh (curl)](#hướng-dẫn-curl)

---

## PHẦN A: KIỂM THỬ CHỨC NĂNG (Functional Testing) {#phần-a}

### A1 — Module XÁC THỰC (Authentication)

| TC# | Tên test case | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Độ ưu tiên |
|-----|--------------|----------------|-----------------|------------------|------------|
| A1-01 | **Đăng ký tài khoản thành công** | `POST /api/v1/auth/register` | `{ "email": "newuser@test.com", "name": "Test User", "password": "Test@1234" }` | HTTP 201, trả về `accessToken` và thông tin user | 🔴 Cao |
| A1-02 | **Đăng nhập thành công (Student)** | `POST /api/v1/auth/login` | `{ "email": "student@gmail.com", "password": "User@123" }` | HTTP 200, trả về `accessToken`, `role: STUDENT` | 🔴 Cao |
| A1-03 | **Đăng nhập thành công (Admin)** | `POST /api/v1/auth/login` | `{ "email": "admin@gmail.com", "password": "Admin@123" }` | HTTP 200, trả về `accessToken`, `role: ADMIN` | 🔴 Cao |
| A1-04 | **Đăng nhập sai mật khẩu** | `POST /api/v1/auth/login` | `{ "email": "student@gmail.com", "password": "SaiMatKhau" }` | HTTP 401, message: "Email hoặc mật khẩu không đúng" | 🔴 Cao |
| A1-05 | **Đăng nhập email không tồn tại** | `POST /api/v1/auth/login` | `{ "email": "khongtontai@abc.com", "password": "abc123" }` | HTTP 401, message: "Email hoặc mật khẩu không đúng" | 🔴 Cao |
| A1-06 | **Đăng ký trùng email** | `POST /api/v1/auth/register` với email đã tồn tại | `{ "email": "student@gmail.com", "name": "Test", "password": "abc" }` | HTTP 409, message: "Email đã được sử dụng" | 🟡 Trung bình |
| A1-07 | **Lấy thông tin user (token hợp lệ)** | `GET /api/v1/auth/me` với `Authorization: Bearer <token>` | Token hợp lệ | HTTP 200, trả về thông tin user hiện tại | 🟡 Trung bình |
| A1-08 | **Cập nhật hồ sơ cá nhân** | `PATCH /api/v1/users/profile` | `{ "name": "Tên Mới" }` với JWT | HTTP 200, name được cập nhật trong DB | 🟡 Trung bình |
| A1-09 | **Đổi mật khẩu** | `PATCH /api/v1/users/profile/password` | `{ "newPassword": "NewPass@123" }` với JWT | HTTP 200, `{ success: true }` | 🟡 Trung bình |

---

### A2 — Module KHÓA HỌC (Courses)

| TC# | Tên test case | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Độ ưu tiên |
|-----|--------------|----------------|-----------------|------------------|------------|
| A2-01 | **Lấy danh sách khóa học** | `GET /api/v1/courses` | Không cần auth | HTTP 200, array khóa học với title, level, lessonCount | 🔴 Cao |
| A2-02 | **Xem chi tiết khóa học** | `GET /api/v1/courses/:id` | ID khóa học hợp lệ | HTTP 200, trả về thông tin đầy đủ + danh sách bài học | 🔴 Cao |
| A2-03 | **Xem chi tiết bài học** | `GET /api/v1/lessons/:id` với JWT Student | ID bài học hợp lệ | HTTP 200, trả về title, content, quizzes, prevLessonId, nextLessonId | 🔴 Cao |
| A2-04 | **Đăng ký khóa học** | `POST /api/v1/enrollments` với JWT Student | `{ "courseId": "<courseId>" }` | HTTP 201, trả về thông tin enrollment | 🔴 Cao |
| A2-05 | **Đăng ký khóa học trùng (đã enroll)** | `POST /api/v1/enrollments` lần 2 cùng courseId | `{ "courseId": "<courseId>" }` | HTTP 409, message: "Bạn đã đăng ký khóa học này rồi" | 🟡 Trung bình |
| A2-06 | **Kiểm tra trạng thái đăng ký** | `GET /api/v1/enrollments/check/:courseId` với JWT Student | ID khóa học đã đăng ký | HTTP 200, `{ enrolled: true, progress: <số%>, completedLessonIds: [...] }` | 🔴 Cao |
| A2-07 | **Hoàn thành bài học (đánh dấu tiến trình)** | `POST /api/v1/lessons/:id/complete` với JWT Student | ID bài học | HTTP 200, progress cập nhật; bài học được đánh dấu COMPLETED | 🔴 Cao |

---

### A3 — Module BÀI KIỂM TRA / QUIZ

| TC# | Tên test case | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Độ ưu tiên |
|-----|--------------|----------------|-----------------|------------------|------------|
| A3-01 | **Lấy quiz theo bài học** | `GET /api/v1/quizzes?lessonId=<id>` | ID bài học có quiz | HTTP 200, array quiz gồm title, questions, options | 🔴 Cao |
| A3-02 | **Làm bài quiz - trả lời đúng tất cả** | `POST /api/v1/quizzes/:id/attempt` với JWT Student | `{ "answers": { "<questionId>": "<correctOptionId>", ... } }` | HTTP 201, `score === totalQuestions` | 🔴 Cao |
| A3-03 | **Làm bài quiz - trả lời sai** | `POST /api/v1/quizzes/:id/attempt` với JWT Student | `{ "answers": { "<questionId>": "<wrongOptionId>", ... } }` | HTTP 201, `score < totalQuestions` | 🔴 Cao |
| A3-04 | **Làm quiz tự động đánh dấu hoàn thành bài học** | Submit quiz thành công → kiểm tra progress | Làm quiz của bài học chưa hoàn thành | Sau khi submit, progress tăng lên; bài học được mark COMPLETED | 🔴 Cao |
| A3-05 | **Lấy chi tiết quiz (kiểm tra đáp án đúng hiển thị)** | `GET /api/v1/quizzes/:id` | ID quiz hợp lệ | HTTP 200, mỗi question có explanation, mỗi option có isCorrect | 🟡 Trung bình |
| A3-06 | **Quiz với ID không tồn tại** | `GET /api/v1/quizzes/:id` với ID giả | ID ngẫu nhiên không tồn tại | HTTP 404, message "Quiz not found" | 🟡 Trung bình |

---

### A4 — Module CHATBOT RAG (AI Chat)

| TC# | Tên test case | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Độ ưu tiên |
|-----|--------------|----------------|-----------------|------------------|------------|
| A4-01 | **Gửi câu hỏi liên quan tiếng Anh** | `POST /api/v1/chat` với JWT | `{ "message": "Thì quá khứ đơn dùng thế nào?" }` | HTTP 200, `reply` chứa giải thích tiếng Anh bằng tiếng Việt; có `sources` và `timings` | 🔴 Cao |
| A4-02 | **Gửi câu hỏi ngoài phạm vi** | `POST /api/v1/chat` với JWT | `{ "message": "Cách nấu phở bò?" }` | HTTP 200, AI từ chối lịch sự, hướng về chủ đề tiếng Anh | 🔴 Cao |
| A4-03 | **Chat có nguồn tham khảo (RAG sources)** | `POST /api/v1/chat` với câu hỏi liên quan tài liệu đã nạp | `{ "message": "Since và For dùng khi nào?" }` | HTTP 200, `sources` là array có `chunk_text`, `score` > 0.5 | 🔴 Cao |
| A4-04 | **Tiếp tục cuộc trò chuyện (session)** | Gửi 2 tin nhắn liên tiếp với cùng sessionId | Message 1 → lấy sessionId → Message 2 | AI nhớ ngữ cảnh cuộc trò chuyện trước; `sessionId` nhất quán | 🔴 Cao |
| A4-05 | **Lấy danh sách sessions** | `GET /api/v1/chat/sessions` với JWT | JWT của Student | HTTP 200, array sessions có `_id`, `title`, `updated_at` | 🟡 Trung bình |
| A4-06 | **Lấy lịch sử tin nhắn trong session** | `GET /api/v1/chat/sessions/:id/messages` | ID session hợp lệ của user | HTTP 200, array messages có `role`, `content`, `created_at` | 🟡 Trung bình |
| A4-07 | **Phản hồi chatbot đúng format Markdown** | Gửi câu hỏi ngữ pháp | Câu hỏi về cấu trúc ngữ pháp | Reply chứa các ký hiệu Markdown (`**bold**`, `|table|`) được render đúng trên frontend | 🟡 Trung bình |
| A4-08 | **Chat dùng lessonId để lọc context** | `POST /api/v1/chat` | `{ "message": "Giải thích bài này", "lessonId": "<id>" }` | HTTP 200, sources chỉ chứa chunks có `lesson_id` tương ứng | 🟢 Thấp |

---

### A5 — Module NẠP TÀI LIỆU (Ingestion - Admin)

| TC# | Tên test case | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Độ ưu tiên |
|-----|--------------|----------------|-----------------|------------------|------------|
| A5-01 | **Upload file .txt thành công** | `POST /api/v1/ingestion/upload` (form-data) với JWT | File `.txt` < 20MB | HTTP 200/201, `status: "PENDING"`, có `documentId` | 🔴 Cao |
| A5-02 | **Upload file .pdf thành công** | `POST /api/v1/ingestion/upload` (form-data) với JWT | File `.pdf` < 20MB | HTTP 200/201, `status: "PENDING"`, có `documentId` | 🔴 Cao |
| A5-03 | **Upload file .docx thành công** | `POST /api/v1/ingestion/upload` (form-data) với JWT | File `.docx` < 20MB | HTTP 200/201, `status: "PENDING"`, có `documentId` | 🔴 Cao |
| A5-04 | **Upload file định dạng không hỗ trợ** | `POST /api/v1/ingestion/upload` với file `.exe` / `.zip` | File `.zip` hoặc `.exe` | HTTP 400, message: "File type not supported" | 🔴 Cao |
| A5-05 | **Xử lý nền thành công (status → DONE)** | Upload file → chờ 30-60 giây → `GET /api/v1/ingestion` | File `.txt` nhỏ | Trạng thái chuyển từ `PENDING` → `DONE`, `chunk_count > 0` | 🔴 Cao |
| A5-06 | **Tìm kiếm vector sau khi nạp tài liệu** | `GET /api/v1/ingestion/search?q=<keyword>` sau khi DONE | Từ khóa có trong file đã upload | HTTP 200, array results có `text`, `score` > 0 | 🔴 Cao |
| A5-07 | **Lấy danh sách tài liệu đã upload** | `GET /api/v1/ingestion` với JWT | JWT user đã upload | HTTP 200, array documents có `filename`, `status`, `chunk_count` | 🟡 Trung bình |
| A5-08 | **Upload không có file** | `POST /api/v1/ingestion/upload` không có file | Body rỗng | HTTP 400, message: "Không tìm thấy file" | 🟡 Trung bình |

---

### A6 — Module SINH ĐỀ THI AI (AI Exam Generator - Admin)

| TC# | Tên test case | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Độ ưu tiên |
|-----|--------------|----------------|-----------------|------------------|------------|
| A6-01 | **Sinh đề thi từ file tài liệu** | `POST /api/v1/admin/generator/analyze` (form-data) với JWT Admin | File `.txt`/`.pdf` tài liệu bài giảng | HTTP 200, `{ title, questions: [...] }` với `questions.length > 0` | 🔴 Cao |
| A6-02 | **Mỗi câu hỏi có 4 options và 1 đáp án đúng** | Kiểm tra response từ A6-01 | - | Mỗi question có đúng `4 options`, trong đó đúng `1 option.isCorrect === true` | 🔴 Cao |
| A6-03 | **Mỗi câu hỏi có giải thích (explanation)** | Kiểm tra response từ A6-01 | - | Mỗi question có `explanation` không rỗng | 🟡 Trung bình |
| A6-04 | **Lưu đề thi vào khóa học** | `POST /api/v1/admin/generator/save` với JWT Admin | `{ "courseId": "<id>", "lessonTitle": "Bài kiểm tra mới", "examData": <exam> }` | HTTP 200, `{ success: true, lessonId, quizId, totalQuestions }` | 🔴 Cao |
| A6-05 | **Bài học được tạo sau khi lưu đề thi** | Sau A6-04, kiểm tra DB | - | Lesson mới tồn tại trong Course, Quiz được liên kết, Questions có options | 🔴 Cao |
| A6-06 | **Sinh đề thi từ file không hỗ trợ** | `POST /api/v1/admin/generator/analyze` với `.exe` | File `.exe` | HTTP 400, thông báo lỗi | 🟡 Trung bình |

---

### A7 — Module QUẢN LÝ NGƯỜI DÙNG (User Management - Admin)

| TC# | Tên test case | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Độ ưu tiên |
|-----|--------------|----------------|-----------------|------------------|------------|
| A7-01 | **Lấy danh sách tất cả user (Admin)** | `GET /api/v1/users` với JWT Admin | - | HTTP 200, array users đầy đủ | 🟡 Trung bình |
| A7-02 | **Tạo user mới (Admin)** | `POST /api/v1/users` với JWT Admin | `{ "email": "newadmin@test.com", "name": "New", "password": "Pass123", "role": "STUDENT" }` | HTTP 201, user mới được tạo không có `passwordHash` trong response | 🟡 Trung bình |
| A7-03 | **Xóa user (Admin)** | `DELETE /api/v1/users/:id` với JWT Admin | ID user hợp lệ | HTTP 204, user bị xóa khỏi DB | 🟡 Trung bình |
| A7-04 | **Xem tiến trình học của user (Admin)** | `GET /api/v1/users/:id/progress` với JWT Admin | ID user | HTTP 200, thông tin tiến trình học | 🟢 Thấp |

---

## PHẦN B: KIỂM THỬ BẢO MẬT (Security Testing) {#phần-b}

### B1 — Kiểm tra Xác thực & Phân quyền

| TC# | Tên test case | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Độ ưu tiên |
|-----|--------------|----------------|-----------------|------------------|------------|
| B1-01 | **Truy cập API không có JWT** | `GET /api/v1/chat/sessions` không có header Authorization | Không có token | HTTP 401, message "Unauthorized" | 🔴 Cao |
| B1-02 | **Truy cập API với JWT giả mạo** | `GET /api/v1/auth/me` với token sai | `Authorization: Bearer token_gia_mao_xyz123` | HTTP 401, message "Unauthorized" | 🔴 Cao |
| B1-03 | **Truy cập API với JWT hết hạn** | Gọi API với token đã hết hạn (cần tạo thủ công) | Token hết hạn | HTTP 401, message "Unauthorized" | 🔴 Cao |
| B1-04 | **Student gọi API Admin (Phân quyền)** | `GET /api/v1/users` với JWT **Student** | JWT của tài khoản Student | HTTP 403, message "Forbidden" | 🔴 Cao |
| B1-05 | **Student tạo khóa học (Phân quyền)** | `POST /api/v1/courses` với JWT Student | `{ "title": "Test course" }` | HTTP 403, không cho phép Student tạo khóa học | 🔴 Cao |
| B1-06 | **Student lấy session chat của user khác** | `GET /api/v1/chat/sessions/:id/messages` với ID session của người khác | JWT Student A, sessionId của Student B | HTTP 200 nhưng trả về `[]` (không có data), hoặc HTTP 404 | 🔴 Cao |
| B1-07 | **Student xóa session của Admin (Admin endpoint)** | `DELETE /api/v1/chat/admin/sessions/:id` với JWT Student | JWT Student | HTTP 403, bị chặn bởi RolesGuard | 🔴 Cao |
| B1-08 | **Student gọi Admin endpoint Ingestion** | `GET /api/v1/users` với JWT Student | JWT Student | HTTP 403 | 🔴 Cao |

---

### B2 — Kiểm tra SQL Injection & NoSQL Injection

| TC# | Tên test case | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Độ ưu tiên |
|-----|--------------|----------------|-----------------|------------------|------------|
| B2-01 | **SQL Injection trong trường email (Login)** | `POST /api/v1/auth/login` | `{ "email": "' OR '1'='1", "password": "anything" }` | HTTP 401 (Bị chặn, không đăng nhập được) | 🔴 Cao |
| B2-02 | **SQL Injection trong query parameter** | `GET /api/v1/courses?id=1' OR '1'='1` | Query có ký tự nguy hiểm | HTTP 400 hoặc trả kết quả bình thường, KHÔNG bị lộ dữ liệu toàn bộ DB | 🔴 Cao |
| B2-03 | **NoSQL Injection trong body chat** | `POST /api/v1/chat` | `{ "message": { "$gt": "" } }` | HTTP 400 hoặc AI trả lời bình thường, KHÔNG bị crash | 🔴 Cao |
| B2-04 | **XSS qua trường message chat** | `POST /api/v1/chat` | `{ "message": "<script>alert('xss')</script>" }` | HTTP 200, script được xử lý như text bình thường, KHÔNG được thực thi | 🔴 Cao |
| B2-05 | **Path traversal trong tên file upload** | `POST /api/v1/ingestion/upload` với tên file đặc biệt | File tên `../../../etc/passwd.txt` | HTTP 200 hoặc 400, server KHÔNG bị path traversal | 🔴 Cao |

---

### B3 — Kiểm tra Input Validation

| TC# | Tên test case | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Độ ưu tiên |
|-----|--------------|----------------|-----------------|------------------|------------|
| B3-01 | **Đăng ký với email sai format** | `POST /api/v1/auth/register` | `{ "email": "khonglaemail", "password": "abc", "name": "Test" }` | HTTP 400, validation error | 🔴 Cao |
| B3-02 | **Đăng ký với body thiếu field bắt buộc** | `POST /api/v1/auth/register` | `{ "email": "a@b.com" }` (thiếu password, name) | HTTP 400, validation error rõ ràng | 🔴 Cao |
| B3-03 | **Chat với body trống** | `POST /api/v1/chat` | `{}` (không có message) | HTTP 400, validation error | 🟡 Trung bình |
| B3-04 | **Upload file vượt giới hạn 20MB** | `POST /api/v1/ingestion/upload` với file > 20MB | File > 20MB | HTTP 413 hoặc 400, báo lỗi file quá lớn | 🟡 Trung bình |
| B3-05 | **Lấy resource với ID không đúng format** | `GET /api/v1/courses/khong-phai-uuid` | ID không phải UUID | HTTP 400 hoặc 404, không gây lỗi 500 | 🟡 Trung bình |
| B3-06 | **Chat với message dạng số (type coercion)** | `POST /api/v1/chat` | `{ "message": 12345 }` | HTTP 400 (nếu validation chặt) hoặc convert thành string và xử lý bình thường | 🟢 Thấp |

---

### B4 — Kiểm tra Password Security

| TC# | Tên test case | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Độ ưu tiên |
|-----|--------------|----------------|-----------------|------------------|------------|
| B4-01 | **Password không xuất hiện trong response** | `POST /api/v1/auth/register` hoặc `GET /api/v1/users` | - | `passwordHash` KHÔNG xuất hiện trong bất kỳ response nào trả về client | 🔴 Cao |
| B4-02 | **Password được hash (bcrypt) trong DB** | Kiểm tra MySQL: `SELECT passwordHash FROM User LIMIT 1` | - | Giá trị bắt đầu bằng `$2b$` (bcrypt), KHÔNG phải plaintext | 🔴 Cao |
| B4-03 | **JWT Secret không bị lộ qua response** | Gọi bất kỳ API nào | - | Response KHÔNG chứa `JWT_SECRET` hay thông tin cấu hình nội bộ | 🔴 Cao |

---

## PHẦN C: KIỂM THỬ HỆ THỐNG (System Testing) {#phần-c}

### C1 — Kiểm tra Tích hợp Database

| TC# | Tên test case | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Độ ưu tiên |
|-----|--------------|----------------|-----------------|------------------|------------|
| C1-01 | **Kết nối MySQL hoạt động** | Chạy `node check-db.mjs` | - | Hiện thông tin users, courses, lessons; không có lỗi kết nối | 🔴 Cao |
| C1-02 | **Kết nối MongoDB hoạt động** | Chạy `node check-db.mjs` | - | Kết nối thành công, collections chat_sessions / chat_messages tồn tại | 🔴 Cao |
| C1-03 | **Kết nối Qdrant hoạt động** | Chạy `node check-db.mjs` hoặc `GET http://localhost:6333/collections` | - | Collection `knowledge_chunks` tồn tại, vectors_count > 0 | 🔴 Cao |
| C1-04 | **Kết nối Redis hoạt động** | Chạy `node check-db.mjs` | - | Redis ping thành công, không có lỗi | 🔴 Cao |
| C1-05 | **Dữ liệu nhất quán giữa MySQL và Qdrant** | Upload tài liệu → kiểm tra DB + Qdrant | Tài liệu mới | MongoDB có document với `status: DONE`, Qdrant có vectors mới với `document_id` tương ứng | 🔴 Cao |
| C1-06 | **Dữ liệu quiz được lưu đúng** | Sinh và lưu đề thi → kiểm tra MySQL | Sinh đề thi AI | Quiz, Questions, Options được tạo trong MySQL; `isCorrect` đúng 1 option per question | 🔴 Cao |

---

### C2 — Kiểm tra Hiệu năng API (Performance)

| TC# | Tên test case | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Độ ưu tiên |
|-----|--------------|----------------|-----------------|------------------|------------|
| C2-01 | **Thời gian phản hồi API (không AI)** | `GET /api/v1/courses` lặp 10 lần | - | Thời gian trung bình < 300ms | 🟡 Trung bình |
| C2-02 | **Thời gian phản hồi Chatbot RAG** | `POST /api/v1/chat` với câu hỏi đơn giản | `{ "message": "What is Present Simple?" }` | Tổng thời gian phản hồi (`timings.totalMs`) < 15.000ms (15 giây) | 🔴 Cao |
| C2-03 | **Embedding latency** | Kiểm tra `timings.embeddingMs` từ response chat | - | `embeddingMs` < 3.000ms | 🟡 Trung bình |
| C2-04 | **Vector search latency** | Kiểm tra `timings.vectorSearchMs` từ response chat | - | `vectorSearchMs` < 2.000ms | 🟡 Trung bình |
| C2-05 | **LLM call latency** | Kiểm tra `timings.llmCallMs` từ response chat | - | `llmCallMs` < 10.000ms | 🟡 Trung bình |
| C2-06 | **Upload file lớn (5MB)** | Upload file pdf 5MB | File PDF 5MB | Hoàn thành trong < 30 giây, status chuyển DONE trong < 120 giây | 🟡 Trung bình |
| C2-07 | **Concurrent requests** | Gửi 5 request chat đồng thời | 5 request với câu hỏi khác nhau | Tất cả trả về HTTP 200, không có lỗi 500 | 🟢 Thấp |

---

### C3 — Kiểm tra Cơ chế Xoay vòng API Key (Key Rotation)

| TC# | Tên test case | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Độ ưu tiên |
|-----|--------------|----------------|-----------------|------------------|------------|
| C3-01 | **Key hợp lệ được sử dụng** | Chạy `node check_keys.js` | - | Ít nhất 1 key PASS với `gemini-2.5-flash` | 🔴 Cao |
| C3-02 | **Chatbot hoạt động khi key đầu tiên bị 429** | Cấu hình key bị rate-limit đứng đầu trong `.env` → gửi chat | Câu hỏi bất kỳ | AI vẫn trả lời được (hệ thống tự chuyển sang key tiếp theo) | 🔴 Cao |
| C3-03 | **Log ghi nhận key rotation** | Gửi nhiều request → kiểm tra NestJS log | - | Log hiển thị `"Calling Gemini ... with Key #N/M"` cho thấy key rotation đang hoạt động | 🟡 Trung bình |
| C3-04 | **Fallback mock khi tất cả key hết quota** | Cấu hình `AI_MOCK_MODE=true` → gửi chat | - | AI trả về phản hồi mock có chứa "mô phỏng (Mock)", hệ thống không bị crash | 🟡 Trung bình |

---

### C4 — Kiểm tra Phục hồi lỗi (Error Recovery)

| TC# | Tên test case | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Độ ưu tiên |
|-----|--------------|----------------|-----------------|------------------|------------|
| C4-01 | **API Backend vẫn chạy sau lỗi AI** | Gửi chat khi AI gặp lỗi (key lỗi) | Key không hợp lệ | API trả về HTTP 200 với message lỗi thân thiện, không crash NestJS | 🔴 Cao |
| C4-02 | **Qdrant search thất bại không làm crash chat** | Tắt Qdrant → gửi chat | - | Chat vẫn hoạt động (AI trả lời dựa trên kiến thức bản thân, không có sources) | 🟡 Trung bình |
| C4-03 | **Backend khởi động lại đúng (hot reload)** | Thay đổi code nhỏ trong API → NestJS watch mode tự reload | - | Server reload thành công trong < 10 giây, API hoạt động bình thường | 🟢 Thấp |
| C4-04 | **Ingestion xử lý file bị hỏng** | Upload file PDF bị corrupt | File PDF hỏng | Document chuyển sang `status: ERROR` trong MongoDB, không gây crash | 🟡 Trung bình |

---

### C5 — Kiểm tra Giao diện & Trải nghiệm (UI/UX - Manual)

| TC# | Tên test case | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Độ ưu tiên |
|-----|--------------|----------------|-----------------|------------------|------------|
| C5-01 | **Sidebar bài học hiển thị đúng** | Truy cập trang bài học sau khi đăng ký khóa học | - | Sidebar hiển thị tất cả bài học, bài đã hoàn thành có icon ✅ xanh | 🔴 Cao |
| C5-02 | **Thanh progress bar cập nhật sau hoàn thành bài** | Hoàn thành bài học → quay lại trang khóa học | - | Progress bar tăng tương ứng % | 🔴 Cao |
| C5-03 | **Markdown render trong chatbot** | Chat với câu hỏi tạo bảng/in đậm | - | Phản hồi AI render đúng bảng, **in đậm**, `code block` trên giao diện | 🔴 Cao |
| C5-04 | **Badges nguồn tham khảo hiển thị** | Chat về nội dung có trong tài liệu đã upload | - | Các badge "Nguồn tham khảo" xuất hiện cuối câu trả lời AI, click vào mở chi tiết | 🔴 Cao |
| C5-05 | **Responsive trên mobile (viewport nhỏ)** | Truy cập http://localhost:3000 từ viewport 375x667 | - | Giao diện không bị vỡ layout, sidebar có thể toggle, chatbox dùng được | 🟡 Trung bình |
| C5-06 | **Admin không thấy menu Chat** | Đăng nhập Admin → kiểm tra sidebar | - | Menu chat (dành cho Student) không hiển thị cho Admin | 🟡 Trung bình |
| C5-07 | **Student không thấy menu Admin** | Đăng nhập Student → kiểm tra sidebar | - | Menu quản trị (ingestion, user management) không hiển thị | 🟡 Trung bình |

---

## HƯỚNG DẪN CHẠY TEST NHANH (CURL) {#hướng-dẫn-curl}

> Lưu ý: Thay `<TOKEN>` bằng access token thực lấy từ bước đăng nhập.

```bash
# ── 1. ĐĂNG NHẬP và lấy TOKEN ──────────────────────────────────────────────────
curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@gmail.com","password":"User@123"}' | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d.accessToken)"

# ── 2. GỬI CHAT (thay <TOKEN>) ──────────────────────────────────────────────────
curl -s -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"message":"Thì hiện tại đơn dùng khi nào?"}' | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log('REPLY:', d.reply.substring(0,200)); console.log('SOURCES:', d.sources.length); console.log('TIMINGS(ms):', d.timings)"

# ── 3. KIỂM TRA BẢO MẬT — Truy cập không có token ──────────────────────────────
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/v1/chat/sessions
# Kết quả mong đợi: 401

# ── 4. KIỂM TRA PHÂN QUYỀN — Student gọi Admin API ─────────────────────────────
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer <STUDENT_TOKEN>" \
  http://localhost:3001/api/v1/users
# Kết quả mong đợi: 403

# ── 5. KIỂM TRA SQL INJECTION ───────────────────────────────────────────────────
curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"'"'"' OR '"'"'1'"'"'='"'"'1","password":"anything"}'
# Kết quả mong đợi: HTTP 401 - Không đăng nhập được

# ── 6. KIỂM TRA UPLOAD FILE KHÔNG HỢP LỆ ────────────────────────────────────────
curl -s -X POST http://localhost:3001/api/v1/ingestion/upload \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@path/to/file.exe"
# Kết quả mong đợi: HTTP 400 - File type not supported

# ── 7. KIỂM TRA KEY ROTATION ──────────────────────────────────────────────────
node check_keys.js
# Kết quả mong đợi: 5+ keys PASS với gemini-2.5-flash

# ── 8. KIỂM TRA DATABASE ──────────────────────────────────────────────────────
node check-db.mjs
# Kết quả mong đợi: 4 DB kết nối thành công, hiện thống kê
```

---

## 📊 TỔNG HỢP TEST CASE

| Nhóm | Tổng TC | 🔴 Cao | 🟡 Trung bình | 🟢 Thấp |
|------|---------|--------|--------------|---------|
| A — Chức năng | 35 | 22 | 11 | 2 |
| B — Bảo mật | 17 | 14 | 3 | 0 |
| C — Hệ thống | 21 | 10 | 9 | 2 |
| **Tổng** | **73** | **46** | **23** | **4** |

---

*Cập nhật lần cuối: 24/06/2026*
