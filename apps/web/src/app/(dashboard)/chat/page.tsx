"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuit, Send, Sparkles, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const mockMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Chào bạn! Mình là AI Trợ giảng của E-learning. Mình có thể giúp gì cho bạn trong bài học hôm nay?",
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const currentInput = input;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: currentInput,
    };

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
          message: currentInput
        })
      });

      if (!res.ok) throw new Error("AI đang bận, vui lòng thử lại sau.");

      const data = await res.json();
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content
      }]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in-up">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          AI Trợ giảng <Sparkles className="h-6 w-6 text-primary" />
        </h1>
        <p className="text-slate-500 mt-1">Hỏi đáp mọi thắc mắc về ngữ pháp, từ vựng hoặc khóa học.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200">
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-6">
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
                      <AvatarImage src="https://i.pravatar.cc/150?u=student" alt="User" />
                      <AvatarFallback>HS</AvatarFallback>
                    </>
                  )}
                </Avatar>
                
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

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
              disabled={isTyping}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
              {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Gửi tin nhắn</span>
            </Button>
          </form>
          <div className="text-center mt-2">
            <span className="text-xs text-slate-400">AI có thể đưa ra câu trả lời không chính xác. Hãy kiểm tra lại thông tin quan trọng.</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
