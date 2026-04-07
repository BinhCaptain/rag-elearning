"use client";

import { useState, useRef, useEffect } from "react";
import { BrainCircuit, MessageSquare, Send, User, Sparkles, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIAssistant() {
  const { id: courseId, lessonId } = useParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Chào bạn! Tôi là Trợ lý AI. Bạn cần giải thích gì về bài học này không?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const token = Cookies.get("token");
      const res = await fetch("http://localhost:3001/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: input,
          lessonId: lessonId
        })
      });

      if (!res.ok) throw new Error("AI đang bận, vui lòng thử lại sau.");

      const data = await res.json();
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.content
      }]);
    } catch (error: any) {
      toast.error(error.message);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Xin lỗi, tôi gặp chút trục trặc khi kết nối. Hãy thử lại sau nhé!"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <aside className="w-full lg:w-80 border-l border-slate-200 bg-white/50 backdrop-blur-sm flex flex-col sticky top-14 self-start" style={{ height: 'calc(100vh - 3.5rem)' }}>
      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="font-bold text-slate-900">AI Trợ giảng</h3>
        </div>
        <Sparkles className="h-4 w-4 text-amber-400" />
      </div>

      <div ref={scrollRef} className="flex-1 p-4 overflow-auto flex flex-col gap-4 scrollbar-hide">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            } animate-fade-in`}
          >
            <div className={`flex items-center gap-1.5 mb-1 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
               {msg.role === "user" ? (
                 <User className="h-3 w-3 text-slate-400" />
               ) : (
                 <BrainCircuit className="h-3 w-3 text-primary" />
               )}
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                 {msg.role === "user" ? "Bạn" : "AI Assistant"}
               </span>
            </div>
            <div
              className={`max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-none"
                  : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col items-start animate-pulse">
            <div className="flex items-center gap-1.5 mb-1">
              <BrainCircuit className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">AI đang trả lời...</span>
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none flex gap-1">
               <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
               <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
               <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              <MessageSquare className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Hỏi AI bất cứ điều gì..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
          </div>
          <button
            onClick={handleSend}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
