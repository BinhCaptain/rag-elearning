"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { BrainCircuit, Send, Sparkles, Plus, Loader2, BookOpen } from "lucide-react";
import { useState } from "react";
import { useChat } from "@/hooks/use-chat";
import type { ChatSource } from "@/lib/chat-api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function SourcesBadge({ sources }: { sources: ChatSource[] }) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors"
      >
        <BookOpen className="h-3 w-3" />
        {sources.length} nguồn tham khảo
        <span className="text-[10px]">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-1.5 animate-fade-in-up">
          {sources.map((s, i) => (
            <div
              key={i}
              className="text-xs bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-slate-600"
            >
              <span className="font-medium text-primary/80">[{i + 1}]</span>{" "}
              {s.chunk_text.slice(0, 150)}
              {s.chunk_text.length > 150 && "..."}
              <span className="ml-2 text-slate-400">
                ({Math.round(s.score * 100)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <div className="flex gap-1">
        <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0ms]" />
        <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
        <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-slate-400 ml-2">AI đang suy nghĩ...</span>
    </div>
  );
}

export default function AdminChatPage() {
  const { messages, isLoading, send, newSession, scrollRef } = useChat();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    send(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in-up">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            AI Trợ giảng <Sparkles className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-slate-500 mt-1">
            Hỏi đáp trực tiếp với AI — kiểm tra nội dung khóa học, tài liệu đã nạp, và hơn thế nữa.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={newSession}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Cuộc trò chuyện mới
        </Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200">
        <div className="flex-1 p-4 overflow-y-auto min-h-0" ref={scrollRef}>
          <div className="flex flex-col gap-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400 gap-3">
                <BrainCircuit className="h-12 w-12 opacity-20" />
                <p className="text-sm font-medium text-slate-500">Bắt đầu cuộc trò chuyện với AI</p>
                <p className="text-xs">Nhập câu hỏi phía dưới để bắt đầu.</p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 max-w-[80%] ${
                  message.role === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                  {message.role === "assistant" ? (
                    <>
                      <AvatarImage src="/placeholder-ai.png" alt="AI" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <BrainCircuit className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
                      <AvatarFallback>AD</AvatarFallback>
                    </>
                  )}
                </Avatar>

                <div>
                  <div
                    className={`rounded-2xl px-5 py-3.5 text-sm shadow-sm max-w-full overflow-x-auto ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm prose prose-sm prose-slate max-w-none"
                    }`}
                  >
                    {message.isLoading ? (
                      <TypingIndicator />
                    ) : message.role === "assistant" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <span className="whitespace-pre-wrap">{message.content}</span>
                    )}
                  </div>

                  {message.role === "assistant" &&
                    message.sources &&
                    message.sources.length > 0 && (
                      <SourcesBadge sources={message.sources} />
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <Input
              placeholder="Hỏi AI Trợ giảng điều gì đó..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Gửi tin nhắn</span>
            </Button>
          </form>
          <div className="text-center mt-2">
            <span className="text-xs text-slate-400">
              AI có thể đưa ra câu trả lời không chính xác. Hãy kiểm tra lại thông tin quan trọng.
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
