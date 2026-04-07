import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, BrainCircuit, CheckCircle2, Clock, Users, Database } from "lucide-react";
import { getUser } from "@/lib/auth";
import { cookies } from "next/headers";

async function getStats() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  const res = await fetch("http://localhost:3001/api/v1/admin/dashboard/stats", {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function AdminDashboardPage() {
  const user = await getUser();
  const stats = await getStats();

  if (!stats) {
    return <div className="p-8 text-center text-slate-500">Không thể tải thông tin thống kê.</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tổng quan Quản trị</h1>
          <p className="text-slate-500 mt-2">Theo dõi tình hình học tập và tương tác AI của học sinh.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Tổng số Học sinh</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.userCount.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Học sinh đăng ký hệ thống</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Khóa học đang mở</CardTitle>
            <BookOpen className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.courseCount}</div>
            <p className="text-xs text-slate-500 mt-1">{stats.lessonCount} bài học đã tạo</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Tài liệu RAG (Chunks)</CardTitle>
            <Database className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.ragStats.chunks.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Trạng thái: {stats.ragStats.status}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-primary">Tương tác AI hôm nay</CardTitle>
            <BrainCircuit className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.quizAttemptCount.toLocaleString()} attempts</div>
            <p className="text-xs text-primary/80 mt-1">Tổng số lượt làm bài trắc nghiệm</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 h-[400px]">
        {/* Active Courses Section */}
        <Card className="col-span-4 shadow-sm border-slate-200 flex flex-col">
          <CardHeader>
            <CardTitle>Khóa học phổ biến nhất</CardTitle>
            <CardDescription>
              Số lượng học viên tham gia theo từng khóa
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 flex-1 overflow-auto">
            {stats.popularCourses.map((course: any) => (
              <div key={course.id} className="flex flex-col gap-2 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-slate-900">{course.title}</span>
                  <span className="text-sm font-medium text-primary">{course.studentCount} học viên</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Logs */}
        <Card className="col-span-3 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-slate-500" />
              Hoạt động hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
               <span className="text-xs text-slate-400">10:45 AM - Hôm nay</span>
               <span className="text-sm text-slate-700">Giáo viên <span className="font-medium text-slate-900">Nguyen_Teacher</span> đã upload tài liệu "Unit 5 Grammar.pdf"</span>
             </div>
             <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
               <span className="text-xs text-slate-400">09:12 AM - Hôm nay</span>
               <span className="text-sm text-emerald-600 font-medium">Hệ thống Ingestion (RAG) đã chunk dữ liệu mới thành công.</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
