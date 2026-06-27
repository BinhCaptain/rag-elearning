"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface LessonActionsProps {
  lessonId: string;
  initialCompleted: boolean;
}

export function LessonActions({ lessonId, initialCompleted }: LessonActionsProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleProgress = async () => {
    setLoading(true);
    const token = Cookies.get("token");

    try {
      const res = await fetch(`http://localhost:3001/api/v1/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to update progress");

      const data = await res.json();
      setIsCompleted(data.status === "COMPLETED");
      toast.success(data.status === "COMPLETED" ? "Đã đánh dấu hoàn thành!" : "Đã bỏ đánh dấu hoàn thành");
      router.refresh();
    } catch (error) {
      toast.error("Không thể cập nhật tiến độ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isCompleted ? "default" : "outline"}
      size="sm"
      className={`gap-2 rounded-full h-8 px-4 font-bold text-xs transition-all ${
        isCompleted 
          ? "bg-green-600 hover:bg-green-700 text-white border-none shadow-lg shadow-green-200" 
          : "text-green-600 border-green-200 hover:bg-green-50"
      }`}
      onClick={toggleProgress}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <CheckCircle2 className={`h-3.5 w-3.5 ${isCompleted ? "text-white" : "text-green-600"}`} />
      )}
      {isCompleted ? "Đã hoàn thành" : "Hoàn thành bài học"}
    </Button>
  );
}
