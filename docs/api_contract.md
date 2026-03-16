# REST API Contract (Brief)

## 1. Auth Module
- `POST /api/auth/register`: Create new student account.
- `POST /api/auth/login`: Authenticate and get JWT.
- `GET /api/auth/me`: Get current user profile.

## 2. Course & Lesson Module
- `GET /api/courses`: List courses (Student/Admin).
- `POST /api/courses`: Create course (Admin).
- `GET /api/courses/:id/lessons`: List lessons in a course.
- `GET /api/lessons/:id`: Get lesson detail.

## 3. Quiz Module
- `GET /api/quizzes/lesson/:lessonId`: Get quiz for lesson.
- `POST /api/quizzes/:id/submit`: Submit quiz answers, returns score & explanation.
- `GET /api/progress/me`: Get student overall progress.

## 4. Chatbot Module (RAG)
- `POST /api/chat`: Send message to AI.
  - Request: `{ sessionId?, message: string, lessonId?: string }`
  - Response: `{ sessionId, reply: string, sources: [...] }`

## 5. Admin / Ingestion Module
- `POST /api/admin/documents/upload`: Upload file (PDF/DOCX) -> starts background ingestion.
- `GET /api/admin/documents`: List uploaded documents and their processing status.
