"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  sendChatMessage,
  getSessionMessages,
  type ChatSource,
} from "@/lib/chat-api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  isLoading?: boolean;
}

const WELCOME_MSG: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Chào bạn! Mình là AI Trợ giảng của E-learning. Mình có thể giúp gì cho bạn trong bài học hôm nay?",
};

export function useChat(lessonId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("chat_session_id");
  });
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Persist sessionId
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("chat_session_id", sessionId);
    }
  }, [sessionId]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load existing session history
  const loadSession = useCallback(async (sid: string) => {
    const history = await getSessionMessages(sid);
    if (history.length > 0) {
      const mapped: ChatMessage[] = history.map((m) => ({
        id: m._id,
        role: m.role === "USER" ? "user" : "assistant",
        content: m.content,
        sources: m.retrieved_sources,
      }));
      setMessages([WELCOME_MSG, ...mapped]);
      setSessionId(sid);
    }
  }, []);

  // Send a message
  const send = useCallback(
    async (input: string) => {
      if (!input.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: input,
      };

      const loadingMsg: ChatMessage = {
        id: `loading-${Date.now()}`,
        role: "assistant",
        content: "",
        isLoading: true,
      };

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setIsLoading(true);

      try {
        const res = await sendChatMessage(
          input,
          sessionId ?? undefined,
          lessonId,
        );

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: res.reply,
          sources: res.sources,
        };

        setMessages((prev) =>
          prev.filter((m) => !m.isLoading).concat(aiMsg),
        );

        if (!sessionId) {
          setSessionId(res.sessionId);
        }
      } catch (err) {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Lỗi: ${err instanceof Error ? err.message : "Không thể kết nối tới AI. Vui lòng thử lại."}`,
        };
        setMessages((prev) =>
          prev.filter((m) => !m.isLoading).concat(errorMsg),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId, lessonId],
  );

  // Start a new session
  const newSession = useCallback(() => {
    setSessionId(null);
    setMessages([WELCOME_MSG]);
    localStorage.removeItem("chat_session_id");
  }, []);

  return {
    messages,
    isLoading,
    sessionId,
    scrollRef,
    send,
    loadSession,
    newSession,
  };
}
