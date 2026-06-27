const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export interface ChatSource {
  chunk_text: string;
  score: number;
  source_id: string;
  topic?: string;
  level?: string;
}

export interface ChatResponse {
  sessionId: string;
  reply: string;
  sources: ChatSource[];
  timings?: {
    sessionSetupMs: number;
    dbSaveUserMsgMs: number;
    dbRetrieveHistoryMs: number;
    embeddingMs: number;
    vectorSearchMs: number;
    llmCallMs: number;
    dbSaveReplyMs: number;
    totalMs: number;
  };
}

export interface ChatMessageData {
  _id: string;
  session_id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  retrieved_sources: ChatSource[];
  created_at: string;
}

export interface ChatSessionData {
  _id: string;
  user_id: string;
  lesson_id: string | null;
  title: string;
  started_at: string;
  updated_at: string;
}

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function sendChatMessage(
  message: string,
  sessionId?: string,
  lessonId?: string,
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ message, sessionId, lessonId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Chat API error: ${res.status}`);
  }

  return res.json();
}

export async function getChatSessions(): Promise<ChatSessionData[]> {
  const res = await fetch(`${API_BASE}/chat/sessions`, {
    headers: authHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessageData[]> {
  const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}/messages`, {
    headers: authHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
}
