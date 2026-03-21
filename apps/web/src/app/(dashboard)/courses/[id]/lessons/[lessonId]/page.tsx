import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, BrainCircuit, ChevronLeft, MessageSquare, PlayCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  prevLessonId: string | null;
  nextLessonId: string | null;
  quizzes: { id: string }[];
}

interface Course {
  id: string;
  title: string;
}

async function getLesson(id: string): Promise<Lesson | null> {
  const res = await fetch(`http://localhost:3001/api/v1/lessons/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function getCourse(id: string): Promise<Course | null> {
  const res = await fetch(`http://localhost:3001/api/v1/courses/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function LessonPage({ params }: { params: { id: string; lessonId: string } }) {
  const { id, lessonId } = await params;
  
  const lesson = await getLesson(lessonId);
  const course = await getCourse(id);

  if (!lesson || !course) {
    notFound();
  }

  const quizId = lesson.quizzes[0]?.id;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 animate-fade-in-up">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href={`/courses/${id}`} className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 text-sm font-medium">
            <ChevronLeft className="h-4 w-4" /> Trở về khóa học
          </Link>
          <Separator orientation="vertical" className="h-6 w-px bg-slate-200 hidden md:block" />
          <div className="hidden md:flex flex-col max-w-[400px]">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">{course.title}</span>
            <span className="text-sm font-medium text-slate-900 truncate">{lesson.title}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 font-medium">
            <Progress value={20} className="w-24 h-2" />
            <span>20%</span>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2 text-primary border-primary/20 hover:bg-primary/5 rounded-full font-bold">
            <BrainCircuit className="h-4 w-4" />
            Hỏi AI Trợ giảng
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* Page Header */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">
                    Bài học {lesson.order}
                 </Badge>
               </div>
               <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                 {lesson.title}
               </h1>
            </div>

            {/* Video Player Mockup */}
            <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-video relative flex items-center justify-center group cursor-pointer shadow-2xl">
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex items-end p-6">
                 <div className="flex items-center gap-3">
                    <PlayCircle className="h-5 w-5 text-primary" />
                    <h2 className="text-white font-medium">Xem video bài giảng</h2>
                 </div>
               </div>
               <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-white/5 shadow-2xl">
                 <PlayCircle className="h-10 w-10 text-white fill-white/10" />
               </div>
            </div>

            {/* Lesson Text Content */}
            <div className="prose prose-slate prose-lg max-w-none">
              <div className="bg-white p-8 md:p-10 border border-slate-200 rounded-3xl shadow-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                 {lesson.content}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-8 pb-16">
              <div className="flex gap-2">
                {lesson.prevLessonId && (
                  <Link href={`/courses/${id}/lessons/${lesson.prevLessonId}`}>
                    <Button variant="outline" className="gap-2">
                      <ArrowLeft className="h-4 w-4" /> Bài trước
                    </Button>
                  </Link>
                )}
                {!lesson.prevLessonId && (
                  <Link href={`/courses/${id}`}>
                    <Button variant="ghost" className="gap-2 text-slate-500 hover:text-slate-900">
                      <ArrowLeft className="h-4 w-4" /> Danh sách
                    </Button>
                  </Link>
                )}
              </div>

              <div className="flex gap-4">
                {quizId && (
                  <Link href={`/courses/${id}/lessons/${lessonId}/quiz/${quizId}`}>
                    <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/5 font-bold">
                      Bắt đầu Trắc nghiệm <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                {lesson.nextLessonId && (
                  <Link href={`/courses/${id}/lessons/${lesson.nextLessonId}`}>
                    <Button className="gap-2 rounded-xl px-6 h-12 shadow-lg shadow-primary/20 font-bold">
                      Bài tiếp theo <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Sidebar */}
        <aside className="w-full lg:w-80 border-l border-slate-200 bg-white/50 backdrop-blur-sm flex flex-col sticky top-14 self-start" style={{ height: 'calc(100vh - 3.5rem)' }}>
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-slate-900">AI Trợ giảng</h3>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto flex flex-col gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <p className="text-sm font-medium text-slate-900">Mẹo học tập cho bài này:</p>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Hãy chú ý các trạng từ chỉ tần suất như 'always', 'usually' để nhận biết thì Hiện Tại Đơn nhé!"
              </p>
            </div>
            
            <div className="space-y-2">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Câu hỏi gợi ý</span>
               <button className="w-full text-left bg-white border border-slate-200 p-3 rounded-xl text-slate-700 hover:border-primary/50 hover:text-primary transition-all text-xs font-semibold shadow-sm">
                  "Sự khác biệt giữa 'do' và 'does'?"
               </button>
               <button className="w-full text-left bg-white border border-slate-200 p-3 rounded-xl text-slate-700 hover:border-primary/50 hover:text-primary transition-all text-xs font-semibold shadow-sm">
                  "Dấu hiệu nhận biết thì này là gì?"
               </button>
            </div>
          </div>
          <div className="p-4 bg-white border-t border-slate-200">
             <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-hover:text-primary transition-colors">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <input 
                  type="text" 
                  placeholder="Hỏi AI bất cứ điều gì..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
