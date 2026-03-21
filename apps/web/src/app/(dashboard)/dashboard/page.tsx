import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, BrainCircuit, CheckCircle2, Clock } from "lucide-react";
import { getUser } from "@/lib/auth";
import AdminDashboardPage from "./admin";

export default async function DashboardPage() {
  const user = await getUser();

  if (user.role === "ADMIN") {
    return <AdminDashboardPage />;
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Xin chào, {user.name}! 👋</h1>
          <p className="text-slate-500 mt-2">Chúc bạn có một ngày học tập thật hiệu quả.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Khóa học đang tham gia</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">3</div>
            <p className="text-xs text-slate-500 mt-1">2 chứng chỉ, 1 phổ thông</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Bài học hoàn thành</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">12</div>
            <p className="text-xs text-slate-500 mt-1">+4 bài học trong tuần này</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Thời gian học tập</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">14h 30m</div>
            <p className="text-xs text-slate-500 mt-1">Tuần này</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-primary/5 hover:bg-primary/10 transition-colors border-primary/20 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-primary">Tương tác AI Chatbot</CardTitle>
            <BrainCircuit className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">28 câu hỏi</div>
            <p className="text-xs text-primary/80 mt-1">Trợ lý ảo đã giải thích ngữ pháp</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 h-[400px]">
        {/* Course Progress Section */}
        <Card className="col-span-4 shadow-sm border-slate-200 flex flex-col h-full">
          <CardHeader>
            <CardTitle>Tiến độ khóa học gần đây</CardTitle>
            <CardDescription>
              Tiếp tục học để hoàn thành mục tiêu khóa học của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 flex-1 overflow-auto">
            {/* Dummy Course 1 */}
            <div className="flex flex-col gap-2 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-900">Ngữ pháp Tiếng Anh THCS - Tập 1</span>
                <span className="text-sm font-medium text-primary">75%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: "75%" }} />
              </div>
              <p className="text-xs text-slate-500">Bài tiếp theo: Unit 4 - Present Perfect Tense</p>
            </div>
            
            {/* Dummy Course 2 */}
            <div className="flex flex-col gap-2 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-900">Từ vựng IELST cho người mới bắt đầu</span>
                <span className="text-sm font-medium text-primary">30%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: "30%" }} />
              </div>
              <p className="text-xs text-slate-500">Bài tiếp theo: Topic 2 - Education & Work</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="col-span-3 shadow-sm border-slate-200 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
               AI Gợi ý học tập
            </CardTitle>
            <CardDescription>
              Dựa trên kết quả Quiz của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="rounded-xl bg-orange-50 border border-orange-100 p-4">
               <h4 className="font-medium text-orange-900 flex items-center gap-2 mb-1">
                 <span className="h-2 w-2 rounded-full bg-orange-500"></span> Cần ôn tập lại
               </h4>
               <p className="text-sm text-orange-700 leading-relaxed">Kết quả Quiz Unit 3 của bạn đạt **55%**. AI khuyên bạn nên xem lại lý thuyết về **Thái Bị Động (Passive Voice)** trước khi sang bài mới.</p>
             </div>
             
             <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
               <h4 className="font-medium text-emerald-900 flex items-center gap-2 mb-1">
                 <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Điểm mạnh
               </h4>
               <p className="text-sm text-emerald-700 leading-relaxed">Bạn làm rất tốt phần Câu Điều Kiện (Conditional Sentences). Điểm Quiz trung bình đạt **90%**.</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
