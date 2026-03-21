import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, BrainCircuit, LineChart } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-screen hero-pattern">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      {/* Header Badge */}
      <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 animate-fade-in-up">
        <Sparkles className="mr-2 h-4 w-4" />
        Phát triển phiên bản MVP đầu tiên
      </div>

      {/* Hero Title */}
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl animate-fade-in-up">
        Nền tảng học Tiếng Anh thông minh với <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">
          AI Chatbot & RAG
        </span>
      </h1>
      
      <p className="text-lg text-slate-600 mb-10 max-w-2xl animate-fade-in-up delay-100">
        Hệ thống E-learning hỗ trợ học sinh THCS học ngữ pháp, từ vựng và giải đáp thắc mắc cùng Trợ lý ảo AI hiểu sâu tài liệu bài học.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-20 animate-fade-in-up delay-200">
        <Link href="/dashboard">
          <Button size="lg" className="rounded-full px-8 text-lg group">
            Bắt đầu học ngay
            <BookOpen className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
        <Link href="/login">
          <Button size="lg" variant="outline" className="rounded-full px-8 text-lg">
            Đăng nhập
          </Button>
        </Link>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full animate-fade-in-up delay-300">
        
        {/* Card 1 */}
        <div className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <BookOpen className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Bài học cấu trúc</h3>
          <p className="text-slate-600">Lộ trình học tập cá nhân hóa, lý thuyết ngữ pháp và từ vựng bám sát chương trình.</p>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <BrainCircuit className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">AI Chatbot RAG</h3>
          <p className="text-slate-600">Trợ lý ảo thông minh tự động đọc tài liệu cấu trúc để giảng giải và hỗ trợ 24/7.</p>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <LineChart className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Theo dõi tiến độ</h3>
          <p className="text-slate-600">Thống kê điểm số Quiz và gợi ý học bài theo Rule-based Engine linh hoạt.</p>
        </div>

      </div>
    </main>
  );
}
