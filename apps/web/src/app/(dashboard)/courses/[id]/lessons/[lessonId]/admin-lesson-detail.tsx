"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Plus, BrainCircuit, ArrowLeft, ArrowRight, PlayCircle, Eye, Trash } from "lucide-react";
import Link from "next/link";
import { CreateQuizModal } from "@/components/courses/create-quiz-modal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  prevLessonId: string | null;
  nextLessonId: string | null;
  quizzes: { id: string; title?: string }[];
}

interface Course {
  id: string;
  title: string;
}

interface AdminLessonDetailPageProps {
  lesson: Lesson;
  course: Course;
}

export default function AdminLessonDetailPage({ lesson, course }: AdminLessonDetailPageProps) {
  const router = useRouter();
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài kiểm tra này không?")) return;

    try {
      const res = await fetch(`http://localhost:3001/api/v1/quizzes/${quizId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete quiz");
      
      toast.success("Đã xóa bài kiểm tra!");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Tính năng xóa quiz trên API chưa được cung cấp hoặc có lỗi xảy ra.");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in-up">
      {/* Breadcrumbs / Back button */}
      <Link href={`/courses/${course.id}`} className="flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors group w-fit">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Quay lại chi tiết Khóa học
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
              Bài học {lesson.order}
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {lesson.title}
            </h1>
          </div>

          <Separator className="bg-slate-200" />

          {/* Lesson Content Preview */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Nội dung bài học
            </h2>
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 whitespace-pre-wrap text-sm leading-relaxed overflow-hidden max-h-[300px] relative">
              {lesson.content || "Chưa có nội dung nội dung văn bản."}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" /> Xem với góc nhìn Học viên
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Sticky Info (Quiz Management) */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl shadow-lg p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Quản lý Trắc nghiệm</h3>
                <p className="text-xs text-slate-500">Bài tập & Câu hỏi</p>
              </div>
            </div>

            <div className="space-y-3">
              {lesson.quizzes && lesson.quizzes.length > 0 ? (
                lesson.quizzes.map((quiz, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50 hover:border-indigo-300 transition-colors group">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">Bài trắc nghiệm {idx + 1}</h4>
                        <p className="text-xs text-slate-500 mt-1">ID: {quiz.id.slice(0, 8)}...</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDeleteQuiz(quiz.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                  Bài học này chưa có câu hỏi trắc nghiệm nào.
                </div>
              )}
            </div>

            <Button 
              className="w-full gap-2 font-bold shadow-md shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700" 
              onClick={() => setIsQuizModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Thêm Trắc nghiệm
            </Button>
          </div>
        </div>
      </div>

      <CreateQuizModal 
        open={isQuizModalOpen} 
        onOpenChange={setIsQuizModalOpen} 
        lessonId={lesson.id} 
      />
    </div>
  );
}
