"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import { Progress } from "@/components/ui/progress";

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  progress?: number;
  firstLessonId?: string;
}

export default function EnrollButton({ courseId, isEnrolled, progress = 0, firstLessonId }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const router = useRouter();
  const token = Cookies.get("token");

  const handleEnroll = async () => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để đăng ký khóa học");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/v1/enrollments/${courseId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Đăng ký thất bại");
      }

      toast.success("Chúc mừng! Bạn đã đăng ký khóa học thành công.");
      setEnrolled(true);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (enrolled) {
    if (!firstLessonId) return null;
    return (
      <div className="w-full space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="text-slate-600">Tiến độ học tập</span>
            <span className="text-primary font-bold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2.5 w-full rounded-full bg-slate-100" />
        </div>
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full text-lg font-bold rounded-xl border-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all flex items-center gap-2"
          onClick={() => router.push(`/courses/${courseId}/lessons/${firstLessonId}`)}
        >
          <CheckCircle2 className="h-5 w-5" />
          Tiếp tục học ngay
        </Button>
      </div>
    );
  }

  return (
    <Button 
      size="lg" 
      className="w-full text-lg font-bold rounded-xl shadow-lg shadow-primary/20 animate-pulse hover:animate-none" 
      onClick={handleEnroll}
      disabled={loading}
    >
      {loading ? (
        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang xử lý...</>
      ) : (
        "Đăng ký khóa học ngay"
      )}
    </Button>
  );
}
