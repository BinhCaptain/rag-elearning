"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuit, Send, Loader2, BookOpen } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatSource } from "@/lib/chat-api";

function SourcesBadge({ sources }: { sources: ChatSource[] }) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors"
      >
        <BookOpen className="h-3 w-3" />
        {sources.length} nguồn tham khảo
        <span className="text-[8px]">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-1.5 animate-fade-in-up">
          {sources.map((s, i) => (
            <div
              key={i}
              className="text-[10px] bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-slate-600"
            >
              <span className="font-medium text-primary/80">[{i + 1}]</span>{" "}
              {s.chunk_text.slice(0, 100)}...
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
        <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export function InlineChat({ lessonId }: { lessonId: string }) {
  const { messages, isLoading, send, scrollRef } = useChat(lessonId);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    send(input);
    setInput("");
  };

  const handleQuickAsk = (question: string) => {
    if (isLoading) return;
    send(question);
  };

  return (
    <aside className="w-full lg:w-80 xl:w-96 border-l border-slate-200 bg-white flex flex-col sticky top-14 self-start" style={{ height: 'calc(100vh - 3.5rem)' }}>
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-slate-900">Hỏi đáp cùng AI</h3>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 max-w-[90%] ${
                message.role === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                {message.role === "assistant" ? (
                  <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                    <BrainCircuit className="h-3 w-3" />
                  </AvatarFallback>
                ) : (
                  <AvatarFallback className="text-[10px]">HS</AvatarFallback>
                )}
              </Avatar>

              <div>
                <div
                  className={`rounded-2xl px-3 py-2 text-xs shadow-sm max-w-full overflow-x-auto ${
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

                {message.role === "assistant" && message.sources && message.sources.length > 0 && (
                  <SourcesBadge sources={message.sources} />
                )}
              </div>
            </div>
          ))}

          {messages.length === 1 && (
            <div className="flex flex-col gap-2 mt-4 ml-8 animate-fade-in">
              <button 
                onClick={() => handleQuickAsk("Tóm tắt ý chính của bài học này")}
                className="text-left bg-white border border-slate-200 p-2 rounded-lg text-slate-700 hover:border-primary hover:text-primary transition-colors text-xs font-medium"
              >
                "Tóm tắt ý chính của bài học này"
              </button>
              <button 
                onClick={() => handleQuickAsk("Cho mình 3 bài tập ví dụ")}
                className="text-left bg-white border border-slate-200 p-2 rounded-lg text-slate-700 hover:border-primary hover:text-primary transition-colors text-xs font-medium"
              >
                "Cho mình 3 bài tập ví dụ"
              </button>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            placeholder="Câu hỏi của bạn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-white h-9 text-xs"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={!input.trim() || isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </aside>
  );
}
