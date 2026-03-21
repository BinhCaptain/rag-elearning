import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, PlayCircle, ChevronRight, Clock, Star, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import AdminCourseDetailPage from "./admin-detail";

interface Lesson {
  id: string;
  title: string;
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  lessons: Lesson[];
}

async function getCourse(id: string): Promise<Course | null> {
  const res = await fetch(`http://localhost:3001/api/v1/courses/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const course = await getCourse(id);
  const user = await getUser();

  if (!course) {
    notFound();
  }

  if (user.role === "ADMIN") {
    return <AdminCourseDetailPage course={course} />;
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in-up">
      {/* Breadcrumbs / Back button */}
      <Link href="/courses" className="flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors group w-fit">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Quay lại tất cả khóa học
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
              Level {course.level}
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {course.title}
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
              {course.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>{course.lessons.length} Bài học</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span>~12 giờ học tập</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>4.9 (120 nhận xét)</span>
            </div>
          </div>

          <Separator className="bg-slate-200" />

          {/* Syllabus */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 font-display">Nội dung bài học</h2>
            <div className="grid gap-3">
              {course.lessons.map((lesson, index) => (
                <Link key={lesson.id} href={`/courses/${id}/lessons/${lesson.id}`}>
                  <div className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors truncate">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <PlayCircle className="h-3 w-3" /> 15 phút bài giảng
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Sticky Info */}
        <div className="hidden lg:block space-y-6">
          <Card className="sticky top-24 overflow-hidden border-slate-200 shadow-xl shadow-slate-200/50 glass-effect">
            <div className="aspect-video bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
               <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                  <PlayCircle className="h-10 w-10 fill-white" />
               </div>
            </div>
            <CardHeader className="p-6">
              <div className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-2">
                Miễn phí
              </div>
              <Button size="lg" className="w-full text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                Bắt đầu học ngay
              </Button>
              <p className="text-center text-xs text-slate-400 mt-4">
                Hoàn thành khóa học để nhận chứng chỉ
              </p>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Khóa học bao gồm:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Truy cập trọn đời
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Hỏi đáp trực tiếp cùng AI
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Bài kiểm tra đánh giá năng lực
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
