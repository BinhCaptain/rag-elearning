# Database Schema Design

## 1. MySQL (Core Data)

### `users`
- id (UUID, PK)
- email (String, Unique)
- password_hash (String)
- role (Enum: STUDENT, ADMIN)
- created_at, updated_at

### `courses`
- id (UUID, PK)
- title (String)
- description (Text)
- level (String: A1, A2, B1...)
- is_published (Boolean)
- created_at, updated_at

### `lessons`
- id (UUID, PK)
- course_id (UUID, FK -> courses)
- title (String)
- content (Text) // Markdown / HTML
- order (Int)
- created_at, updated_at

### `quizzes`
- id (UUID, PK)
- lesson_id (UUID, FK -> lessons)
- title (String)

### `questions`
- id (UUID, PK)
- quiz_id (UUID, FK -> quizzes)
- content (Text)
- explanation (Text)

### `options`
- id (UUID, PK)
- question_id (UUID, FK -> questions)
- content (String)
- is_correct (Boolean)

### `quiz_attempts`
- id (UUID, PK)
- user_id (UUID, FK -> users)
- quiz_id (UUID, FK -> quizzes)
- score (Int)
- total_questions (Int)
- created_at

### `progress`
- id (UUID, PK)
- user_id (UUID, FK -> users)
- lesson_id (UUID, FK -> lessons)
- status (Enum: COMPLETED, IN_PROGRESS)
- completed_at (DateTime)

---

## 2. MongoDB (Chat Logs & Unstructured Data)

### `chat_sessions`
- \_id (ObjectId)
- user_id (String/UUID)
- lesson_id (String/UUID, Optional)
- started_at (Date)
- updated_at (Date)

### `chat_messages`
- \_id (ObjectId)
- session_id (ObjectId, FK -> chat_sessions)
- role (Enum: USER, ASSISTANT, SYSTEM)
- content (String)
- retrieved_sources (Array of Object: { chunk_text, score, source_id })
- created_at (Date)

---

## 3. Qdrant (Vector Database)

### Collection `knowledge_chunks`
- **Vector**: 1536 dims (OpenAI `text-embedding-3-small`)
- **Payload / Metadata**:
  - `document_id`: UUID
  - `lesson_id`: UUID (Optional)
  - `topic`: String
  - `level`: String
  - `chunk_text`: Text
