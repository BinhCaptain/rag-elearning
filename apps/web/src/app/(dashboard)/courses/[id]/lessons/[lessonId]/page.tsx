import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, BrainCircuit, ChevronLeft, MessageSquare, PlayCircle, ListChecks, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import AdminLessonDetailPage from "./admin-lesson-detail";
import { LessonActions } from "./lesson-actions";
import { cookies } from "next/headers";

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  prevLessonId: string | null;
  nextLessonId: string | null;
  quizzes: { id: string }[];
  isCompleted: boolean;
}

interface Course {
  id: string;
  title: string;
  lessons: {
    id: string;
    title: string;
    order: number;
    quizzes: { id: string }[];
  }[];
}

async function getLesson(id: string, token?: string): Promise<Lesson | null> {
  const res = await fetch(`http://localhost:3001/api/v1/lessons/${id}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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

async function getEnrollmentStatus(courseId: string, token?: string): Promise<{ enrolled: boolean; progress: number; completedLessonIds: string[] }> {
  if (!token) return { enrolled: false, progress: 0, completedLessonIds: [] };
  try {
    const res = await fetch(`http://localhost:3001/api/v1/enrollments/check/${courseId}`, {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { enrolled: false, progress: 0, completedLessonIds: [] };
    const data = await res.json();
    return data;
  } catch {
    return { enrolled: false, progress: 0, completedLessonIds: [] };
  }
}

export default async function LessonPage({ params }: { params: { id: string; lessonId: string } }) {
  const { id, lessonId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  const lesson = await getLesson(lessonId, token);
  const course = await getCourse(id);
  const user = await getUser();
  const enrollmentStatus = await getEnrollmentStatus(id, token);

  if (!lesson || !course) {
    notFound();
  }

  if (user.role === "ADMIN") {
    return <AdminLessonDetailPage lesson={lesson} course={course} />;
  }

  const quizId = lesson.quizzes[0]?.id;
  const progressPercent = enrollmentStatus.progress;
  const completedLessonIds = enrollmentStatus.completedLessonIds || [];

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
            <Progress value={progressPercent} className="w-24 h-2" />
            <span>{progressPercent}%</span>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2 text-primary border-primary/20 hover:bg-primary/5 rounded-full font-bold">
            <BrainCircuit className="h-4 w-4" />
            Trợ lý AI
          </Button>
        </div>
      </header>
  
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Syllabus Sidebar */}
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-primary" />
              Nội dung khóa học
            </h3>
          </div>
          <div className="flex-1 overflow-auto py-2">
            {course.lessons.sort((a,b) => a.order - b.order).map((l) => {
              const isCompleted = completedLessonIds.includes(l.id);
              return (
                <Link 
                  key={l.id} 
                  href={`/courses/${id}/lessons/${l.id}`}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    l.id === lessonId 
                      ? "bg-primary/5 text-primary font-bold border-r-2 border-primary" 
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    isCompleted 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : l.order}
                  </div>
                  <span className="flex-1 truncate text-left">{l.title}</span>
                  {!isCompleted && l.quizzes.length > 0 && <BrainCircuit className="h-3 w-3 text-amber-500 shrink-0" />}
                </Link>
              );
            })}
          </div>
        </aside>
  
        <div className="flex-1 overflow-auto bg-slate-50">
          <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row min-h-full">
            {/* Main Content Area */}
            <div className="flex-1 p-4 md:p-6 lg:p-8">
              <div className="max-w-3xl mx-auto space-y-8">
                {/* Page Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold uppercase tracking-wider text-[10px]">
                      Bài học {lesson.order}
                    </Badge>
                    <LessonActions key={lesson.id} lessonId={lesson.id} initialCompleted={lesson.isCompleted} />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {lesson.title}
                  </h1>
                </div>

                {/* Video Player */}
                {lesson.videoUrl ? (
                  <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-video shadow-2xl">
                    {lesson.videoUrl.includes('/uploads/') || lesson.videoUrl.endsWith('.mp4') || lesson.videoUrl.endsWith('.webm') ? (
                      <video
                        src={lesson.videoUrl}
                        className="w-full h-full"
                        controls
                        title={lesson.title}
                      />
                    ) : (
                      <iframe
                        src={getEmbedUrl(lesson.videoUrl)}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={lesson.title}
                      />
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-video relative flex items-center justify-center group shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex items-end p-6">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="h-5 w-5 text-primary" />
                        <h2 className="text-white font-medium text-sm">Bài học này chưa có video bài giảng</h2>
                      </div>
                    </div>
                    <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                      <PlayCircle className="h-10 w-10 text-white/40" />
                    </div>
                  </div>
                )}

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
          </div>
        </div>
      </div>
    </div>
  );
}

function getEmbedUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("youtube.com") && urlObj.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${urlObj.searchParams.get("v")}`;
    }
    if (urlObj.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${urlObj.pathname}`;
    }
    if (urlObj.hostname.includes("vimeo.com")) {
      return `https://player.vimeo.com/video${urlObj.pathname}`;
    }
    return url;
  } catch {
    return url;
  }
}
