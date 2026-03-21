import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, BrainCircuit, CheckCircle, ChevronLeft, MessageSquare, PlayCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function LessonPage({ params }: { params: { id: string } }) {
  // Mock data for UI
  const lessonTitle = "Unit 1: Present Simple Tense (Thì Hiện Tại Đơn)";
  const courseName = "Ngữ pháp Tiếng Anh THCS - Tập 1";
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 animate-fade-in-up">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/courses" className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 text-sm font-medium">
            <ChevronLeft className="h-4 w-4" /> Trở về
          </Link>
          <Separator orientation="vertical" className="h-6 w-px bg-slate-200 hidden md:block" />
          <div className="hidden md:flex flex-col">
            <span className="text-xs text-slate-500">{courseName}</span>
            <span className="text-sm font-medium text-slate-900 truncate max-w-[300px] lg:max-w-[500px]">{lessonTitle}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
            <Progress value={25} className="w-24 h-2" />
            <span>25% Hoàn thành</span>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2 text-primary border-primary/20 hover:bg-primary/5">
            <BrainCircuit className="h-4 w-4" />
            Hỏi AI Trợ giảng
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* Video Player Mockup */}
            <div className="rounded-xl overflow-hidden bg-slate-900 aspect-video relative flex items-center justify-center group cursor-pointer shadow-lg">
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-4">
                 <h2 className="text-white font-medium text-lg">Phần 1: Cấu trúc và Cách dùng</h2>
               </div>
               <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-all group-hover:scale-110">
                 <PlayCircle className="h-8 w-8 text-white ml-1" />
               </div>
            </div>

            {/* Lesson Text Content */}
            <div className="prose prose-slate max-w-none">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 m-0">{lessonTitle}</h1>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">Video Bài Giảng</Badge>
              </div>
              
              <div className="bg-white p-6 md:p-8 border border-slate-200 rounded-xl shadow-sm text-slate-700 leading-relaxed space-y-4">
                <h3 className="text-xl font-semibold text-slate-900 mt-0">Mục tiêu bài học</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Nắm vững công thức khẳng định, phủ định, nghi vấn của động từ "to be" và động từ thường.</li>
                  <li>Nhận biết các dấu hiệu (trạng từ chỉ tần suất) của thì HTĐ.</li>
                  <li>Ứng dụng vào bài tập điền từ và viết lại câu.</li>
                </ul>
                
                <Separator className="my-6" />
                
                <h3 className="text-xl font-semibold text-slate-900">Nội dung tóm tắt</h3>
                <p>
                  Thì hiện tại đơn (Present Simple) dùng để diễn tả một hành động mang tính thường xuyên (habitual action), 
                  một sự thật hiển nhiên (general truth) hoặc một chân lý.
                </p>
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg font-mono text-sm">
                  <p className="text-slate-800 font-semibold mb-2">Công thức với Động từ thường (V):</p>
                  <p className="text-emerald-700">(+) S + V(s/es) + Object</p>
                  <p className="text-red-700">(-) S + do/does + not + V(nguyên mẫu)</p>
                  <p className="text-blue-700">(?) Do/Does + S + V(nguyên mẫu)?</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 pb-12">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Bài trước
              </Button>
              <Button className="gap-2">
                Làm bài tập trắc nghiệm <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
          </div>
        </div>

        {/* Sidebar / Sidebar AI Chat (Desktop Only for Layout) */}
        <aside className="w-full lg:w-80 xl:w-96 border-l border-slate-200 bg-white flex flex-col sticky top-14 self-start" style={{ height: 'calc(100vh - 3.5rem)' }}>
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-slate-900">Hỏi đáp cùng AI</h3>
          </div>
          <div className="flex-1 p-4 overflow-auto flex flex-col gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
              <p className="text-slate-600 mb-3">Bạn có câu hỏi nào về Thì Hiện Tại Đơn không? Hãy hỏi mình nhé!</p>
              <div className="flex flex-col gap-2">
                <button className="text-left bg-white border border-slate-200 p-2 rounded-lg text-slate-700 hover:border-primary hover:text-primary transition-colors text-xs font-medium">
                  "Khi nào thêm 's', khi nào thêm 'es'?"
                </button>
                <button className="text-left bg-white border border-slate-200 p-2 rounded-lg text-slate-700 hover:border-primary hover:text-primary transition-colors text-xs font-medium">
                  "Cho mình 5 bài tập ví dụ."
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-slate-200">
             <Button className="w-full justify-start text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-900" variant="secondary">
                <MessageSquare className="h-4 w-4 mr-2" />
                Nhập câu hỏi...
             </Button>
          </div>
        </aside>

      </div>
    </div>
  );
}
