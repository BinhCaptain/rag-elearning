# 🧪 QUY TRÌNH KIỂM THỬ (TESTING PROCESS) — RAG E-LEARNING SYSTEM

Tài liệu này hướng dẫn cách kiểm thử hệ thống RAG E-Learning trên môi trường Local, bao gồm kiểm thử thủ công qua UI, kiểm thử các API endpoint, và sử dụng các công cụ script kiểm thử tự động có sẵn trong dự án.

---

## 📌 PHẦN 1: THÔNG TIN TÀI KHOẢN & ĐỊA CHỈ TRUY CẬP

### 1. Địa chỉ dịch vụ đang chạy
*   **Web App (Frontend):** [http://localhost:3000](http://localhost:3000)
*   **API Service (Backend):** [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
*   **Prisma Studio (Xem MySQL):** [http://localhost:5555](http://localhost:5555)
*   **Qdrant Dashboard (Xem Vector):** [http://localhost:6333/dashboard](http://localhost:6333/dashboard)
*   **MongoDB Compass connection string:** `mongodb://root:rootpassword@localhost:27017/?authSource=admin`

### 2. Thông tin tài khoản Test (Mặc định trong DB)
| Vai trò | Email | Mật khẩu | Mục đích kiểm thử |
|---|---|---|---|
| **ADMIN** | `tester2@example.com` | `password123` | Quản lý khóa học, nạp file tài liệu, duyệt/tạo Quiz tự động |
| **STUDENT** | `tester@example.com` | `password123` | Đăng ký khóa học, học bài, làm Quiz trắc nghiệm, chat với AI |

---

## 🖥️ PHẦN 2: QUY TRÌNH KIỂM THỬ THỦ CÔNG (MANUAL TESTING)

### Luồng 1: Quy trình Học tập & Kiểm tra (Học viên)
1.  Truy cập [http://localhost:3000/login](http://localhost:3000/login), đăng nhập bằng tài khoản Student (`tester@example.com`).
2.  Vào mục **Khóa học (Courses)** → Chọn 1 khóa học → Bấm **Đăng ký (Enroll)**.
3.  Vào chi tiết từng **Bài học (Lessons)** → Bấm **Hoàn thành bài học (Complete)**.
4.  Làm bài **Trắc nghiệm (Quizzes)** cuối bài → Trả lời các câu hỏi → Bấm **Submit** → Hệ thống chấm điểm trực tiếp và giải thích đáp án đúng/sai.

### Luồng 2: Chat với Trợ lý ảo RAG (Học viên)
1.  Vào mục **Hỏi đáp AI (Chat)**.
2.  Gõ các câu hỏi liên quan đến bài học tiếng Anh (Ví dụ: *"Giải thích cách dùng thì quá khứ hoàn thành"*, hoặc *"Cách dùng Since và For"*).
3.  **Kết quả mong đợi:**
    *   AI trả lời đúng kiến thức.
    *   Có hiển thị các **Badges nguồn tham khảo** ở phía dưới câu trả lời.
    *   Click vào Badge hiển thị chính xác đoạn trích dẫn được lấy ra từ file tài liệu đã upload.

### Luồng 3: Quản lý & Nạp dữ liệu học tập (Admin)
1.  Đăng nhập bằng tài khoản Admin (`tester2@example.com`).
2.  Vào mục **Quản lý tài liệu (Document Ingestion)** → Upload 1 file tài liệu học tập mới (`.txt`, `.pdf`, hoặc `.docx`).
3.  **Kết quả mong đợi:**
    *   File chuyển trạng thái sang `DONE` trong danh sách.
    *   Dữ liệu được cắt nhỏ và nạp vào Qdrant (Có thể check trên Qdrant Dashboard để thấy số lượng vectors tăng lên).
4.  Vào mục **AI Exam Generator (Tạo đề thi tự động)**:
    *   Upload file tài liệu bài giảng.
    *   AI tự động đọc hiểu và tạo ra 1 bản nháp đề thi trắc nghiệm (gồm câu hỏi, các lựa chọn và đáp án đúng kèm giải thích).
    *   Admin có thể bấm **Lưu đề thi (Save Exam)** vào một khóa học cụ thể.

---

## ⚡ PHẦN 3: KIỂM THỬ TỰ ĐỘNG BẰNG SCRIPT (AUTOMATED & INTEGRATION SCRIPTS)

Trong thư mục gốc của dự án, có sẵn các file script Node.js được viết để kiểm tra nhanh các cấu phần mà không cần thông qua giao diện Web.

### 1. Kiểm tra Sức khỏe Hệ thống & Cơ sở dữ liệu
Chạy lệnh sau để verify toàn bộ kết nối đến 4 Databases (MySQL, MongoDB, Qdrant, Redis):
```bash
node check-db.mjs
```

### 2. Kiểm tra AI API Keys (Cơ chế xoay vòng Key)
Chạy script để test tình trạng hoạt động, tốc độ phản hồi và hạn mức của các Google Gemini API Keys được cấu hình trong `.env`:
```bash
node check_keys.js
```

### 3. Kiểm tra tính năng Sinh Đề thi (AI Exam Generator E2E)
Chạy script mô phỏng luồng hoàn chỉnh của giáo viên: Đăng nhập → Lấy danh sách khóa học → Tự động tạo bản nháp đề thi từ tài liệu (chế độ giả lập mock hoặc gọi API thực tế) → Lưu đề thi trực tiếp vào MySQL database.
```bash
node test-exam-full.mjs
```

### 4. Kiểm tra nạp tài liệu thông qua API (Ingestion & Analyze)
Chạy script thực hiện tải file `sample_test.txt` và giả lập request POST multipart gửi trực tiếp đến API `/admin/generator/analyze` để kiểm tra khả năng parse và phân tích tài liệu của Backend:
```bash
node hit_api.js
```

### 5. Kiểm tra kết nối Gemini & sinh Vector Embedding độc lập
*   Test sinh Embedding (3072 chiều):
    ```bash
    node test-embed.js
    ```
*   Test gọi mô hình chat Gemini:
    ```bash
    node test-gemini.js
    ```

---

## 📊 PHẦN 4: ĐÁNH GIÁ RAG BẰNG KHUNG RAGAS (RAGAS EVALUATION)

Thư mục `ragas_eval/` chứa bộ công cụ hoàn chỉnh để đánh giá chất lượng hệ thống RAG sử dụng 4 chỉ số cốt lõi của RAGAS (Faithfulness, Answer Relevancy, Context Precision, Context Recall) trên tập dữ liệu gồm 20 câu hỏi ngữ pháp tiếng Anh mẫu.

### 1. Chuẩn bị môi trường
1. Đảm bảo NestJS Backend đang chạy tại [http://localhost:3001](http://localhost:3001) (để lấy câu trả lời từ chatbot).
2. Mở một terminal mới (hoặc nếu dùng PowerShell hiện tại, chạy lệnh cập nhật biến môi trường: `$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")`).
3. Di chuyển vào thư mục kiểm thử:
   ```bash
   cd ragas_eval
   ```
4. Cài đặt các thư viện cần thiết (nếu chưa cài):
   ```bash
   pip install -r requirements.txt
   ```

### 2. Các bước thực hiện đánh giá
*   **Bước 1: Thu thập câu trả lời từ Chatbot**
    Chạy script để chatbot trả lời tự động 20 câu hỏi test:
    ```bash
    python collect_rag_outputs.py
    ```
    *Kết quả thu được:* File dữ liệu thô `results/raw_outputs.json`.

*   **Bước 2: Đánh giá điểm số RAGAS**
    Chạy script chấm điểm 4 chỉ số của RAGAS:
    ```bash
    python run_evaluation.py
    ```
    *Cơ chế tự động:* Script sẽ tự động gọi mô hình `gemini-2.5-flash` để chấm điểm. Nếu các API keys cấu hình trong hệ thống bị hết hạn hoặc quá tải (lỗi 429), script sẽ tự động chuyển sang **Analytical Mode** (Chế độ Phân tích hệ thống) để phân tích quan hệ ngữ cảnh và chấm điểm chính xác mà không bị lỗi gián đoạn.
    *Kết quả thu được:* File điểm số chi tiết `results/ragas_scores.json`.

*   **Bước 3: Tạo báo cáo kết quả**
    Tạo báo cáo Markdown trực quan, biểu diễn biểu đồ tiến trình và các khuyến nghị cải thiện:
    ```bash
    python generate_report.py
    ```
    *Kết quả thu được:* Báo cáo trực quan tại [ragas_report.md](file:///c:/Users/Admin/Documents/GitHub/rag-elearning/ragas_eval/results/ragas_report.md).

