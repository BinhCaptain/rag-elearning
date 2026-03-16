# Use Cases & Functional Requirements

## 1. Actor: Student
- **UC1.1 - Register / Login**: Học sinh có thể đăng ký tài khoản mới và đăng nhập.
- **UC1.2 - Xem danh sách khóa học**: Học sinh xem các khóa học có sẵn được phân loại theo level.
- **UC1.3 - Học bài (Lesson View)**: Học sinh có thể xem nội dung bài học (Grammar, Vocabulary).
- **UC1.4 - Làm bài tập (Quiz)**: Học sinh làm quiz trắc nghiệm và nộp bài để biết điểm.
- **UC1.5 - Theo dõi tiến độ (Progress Tracking)**: Học sinh xem tiến độ học tập của bản thân trên Dashboard.
- **UC1.6 - Tương tác với AI Chatbot**: Học sinh có thể hỏi AI về nội dung bài học, ngữ pháp, từ vựng và nhận giải thích.

## 2. Actor: Teacher / Admin
- **UC2.1 - Quản lý Khóa học (Course Management)**: Tạo, sửa, xóa, publish các khóa học.
- **UC2.2 - Quản lý Bài học (Lesson Management)**: Thêm bài học, nội dung văn bản, đính kèm tài liệu vào khóa học.
- **UC2.3 - Quản lý Quiz**: Soạn thảo câu hỏi trắc nghiệm, đáp án và giải thích cho từng lesson.
- **UC2.4 - Quản lý Dữ liệu AI (RAG Ingestion)**: Upload tài liệu (DOCX, PDF, txt) để AI cập nhật kiến thức.
- **UC2.5 - Quản lý User**: Xem danh sách học sinh và tiến độ học tập của họ.

## 3. System (Background)
- **UC3.1 - Auto Grading**: Tự động chấm điểm Quiz ngay khi học sinh nộp bài.
- **UC3.2 - Document Processing Pipeline**: Hàm xử lý tự động khi Admin upload file (Parse -> Chunk -> Embed -> Lưu Qdrant).
- **UC3.3 - Rule-based Recommendation**: Gợi ý học bài tiếp theo hoặc ôn bài cũ dựa trên điểm Quiz (<60%: ôn lại, >80%: bài mới).
