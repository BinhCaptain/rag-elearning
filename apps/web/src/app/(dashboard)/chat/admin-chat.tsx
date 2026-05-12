"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BrainCircuit,
  MessageSquare,
  Search,
  Trash2,
  RefreshCw,
  User,
  Loader2,
  ChevronRight,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatSession {
  _id: string;
  user_id: string;
  title: string;
  updated_at: string;
  created_at: string;
}

interface ChatMessage {
  _id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  created_at: string;
}

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = Cookies.get("token");

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch("http://localhost:3001/api/v1/chat/admin/sessions?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể tải sessions");
      const data = await res.json();
      setSessions(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingSessions(false);
    }
  }, [token]);

  const fetchMessages = useCallback(async (sessionId: string) => {
    setLoadingMessages(true);
    setMessages([]);
    try {
      const res = await fetch(`http://localhost:3001/api/v1/chat/admin/sessions/${sessionId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể tải tin nhắn");
      const data = await res.json();
      setMessages(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingMessages(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSelectSession = (session: ChatSession) => {
    setSelectedSession(session);
    fetchMessages(session._id);
  };

  const handleDelete = async (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Xóa session "${session.title}"?`)) return;
    setDeletingId(session._id);
    try {
      const res = await fetch(`http://localhost:3001/api/v1/chat/admin/sessions/${session._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok && res.status !== 204) throw new Error("Xóa thất bại");
      toast.success("Đã xóa session");
      setSessions((prev) => prev.filter((s) => s._id !== session._id));
      if (selectedSession?._id === session._id) {
        setSelectedSession(null);
        setMessages([]);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSessions = sessions.filter(
    (s) =>
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.user_id?.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in-up h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-primary" />
            Lịch sử Chat AI
          </h1>
          <p className="text-slate-500 mt-1">
            Xem toàn bộ cuộc hội thoại của users với AI Trợ giảng.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-3 py-1.5 text-sm">
            {sessions.length} sessions
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchSessions} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loadingSessions ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Sessions panel */}
        <Card className="w-80 shrink-0 flex flex-col border-slate-200 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Tìm session..."
                className="pl-8 h-8 text-sm bg-slate-50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Session list */}
          <div className="flex-1 overflow-y-auto">
            {loadingSessions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 px-4 text-center">
                <MessageSquare className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">Không có session nào</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <button
                  key={session._id}
                  onClick={() => handleSelectSession(session)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors group relative ${
                    selectedSession?._id === session._id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {session.title || "Cuộc trò chuyện"}
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        User: {session.user_id?.slice(0, 8)}...
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                        <Clock className="h-2.5 w-2.5" />
                        {formatTime(session.updated_at || session.created_at)}
                      </div>
                    </div>
                  </div>
                  {/* Delete btn */}
                  <button
                    onClick={(e) => handleDelete(session, e)}
                    disabled={deletingId === session._id}
                    className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                  >
                    {deletingId === session._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Messages panel */}
        <Card className="flex-1 flex flex-col border-slate-200 overflow-hidden">
          {!selectedSession ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <ChevronRight className="h-12 w-12 mb-3 opacity-20" />
              <p className="font-medium text-slate-500">Chọn một session để xem lịch sử</p>
              <p className="text-sm mt-1">Click vào session bên trái để xem tin nhắn</p>
            </div>
          ) : (
            <>
              {/* Session header */}
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
                <p className="font-semibold text-slate-800">{selectedSession.title || "Cuộc trò chuyện"}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  User ID: {selectedSession.user_id} · {formatTime(selectedSession.updated_at || selectedSession.created_at)}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p>Không có tin nhắn</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex gap-3 max-w-[80%] ${msg.role === "USER" ? "ml-auto flex-row-reverse" : ""}`}
                    >
                      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                        <AvatarFallback
                          className={
                            msg.role === "ASSISTANT"
                              ? "bg-primary text-primary-foreground text-xs"
                              : "bg-slate-200 text-slate-600 text-xs"
                          }
                        >
                          {msg.role === "ASSISTANT" ? <BrainCircuit className="h-3.5 w-3.5" /> : "HS"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          msg.role === "USER"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm prose prose-sm prose-slate max-w-none"
                        }`}
                      >
                        {msg.role === "ASSISTANT" ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        ) : (
                          <span className="whitespace-pre-wrap">{msg.content}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
