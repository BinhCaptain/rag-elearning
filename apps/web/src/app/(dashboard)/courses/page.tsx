import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, AlertCircle, ArrowRight } from "lucide-react";
import { getUser } from "@/lib/auth";
import AdminCoursesPage from "./admin";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  isPublished: boolean;
  _count: {
    lessons: number;
  };
}

async function getCourses(isAdmin: boolean = false): Promise<Course[]> {
  const url = new URL("http://localhost:3001/api/v1/courses");
  if (isAdmin) {
    url.searchParams.append("isAdmin", "true");
  }
  
  const res = await fetch(url.toString(), {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function CoursesPage() {
  const user = await getUser();
  const courses = await getCourses(user.role === "ADMIN");

  if (user.role === "ADMIN") {
    return <AdminCoursesPage initialCourses={courses} />;
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display">Khám phá Khóa học</h1>
          <p className="text-slate-500 mt-1">Lộ trình học tập được thiết kế bởi chuyên gia dành riêng cho học sinh THCS.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, index) => (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <Card className="group h-full flex flex-col hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-slate-200 overflow-hidden glass-effect">
              <div className="h-40 relative flex items-center justify-center bg-gradient-to-br from-primary/5 to-indigo-500/5 group-hover:from-primary/10 group-hover:to-indigo-500/10 transition-colors">
                <div className="h-16 w-16 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                {course.level && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider text-primary shadow-sm ring-1 ring-primary/10 uppercase">
                      Level: {course.level}
                    </span>
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {course._count.lessons} Bài học
                  </span>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-slate-500 min-h-[2.5rem]">{course.description}</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center">
                  Vào học ngay <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </CardFooter>
            </Card>
          </Link>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Chưa có khóa học nào</h3>
            <p className="text-slate-500">Hệ thống đang được cập nhật thêm nội dung mới.</p>
          </div>
        )}
      </div>
    </div>
  );
}
