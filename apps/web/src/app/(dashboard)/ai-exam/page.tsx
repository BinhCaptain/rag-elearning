"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BrainCircuit, UploadCloud, FileText, Loader2, BookOpen, Sparkles, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Cookies from "js-cookie";

interface Course {
  id: string;
  title: string;
}

export default function AIExamPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftExam, setDraftExam] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadCourses() {
      try {
        const token = Cookies.get("token");
        const res = await fetch("http://localhost:3001/api/v1/courses", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Thất bại");
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        toast.error("Không thể tải danh sách khóa học");
      }
    }
    loadCourses();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'docx', 'doc', 'md', 'txt'].includes(ext || '')) {
        toast.error("Định dạng không hợp lệ. Vui lòng chọn file PDF, Word, Txt hoặc Markdown.");
        return;
      }
      setFile(selected);
    }
  };

  const handleGenerate = async () => {
    if (!file) return toast.error("Vui lòng tải lên đề mẫu");

    setIsGenerating(true);
    const token = Cookies.get("token");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3001/api/v1/admin/generator/analyze", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");

      setDraftExam(data);
      if (!lessonTitle) setLessonTitle(data.title || "Đề thi AI");
      
      if (data._isFallback) {
        toast.warning("API Gemini đang bị giới hạn quota. Đề mẫu tạm thời được dùng để preview.");
      } else {
        toast.success("Sinh đề AI thành công!");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi sinh đề AI. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCourse) return toast.error("Vui lòng chọn khóa học");
    if (!lessonTitle.trim()) return toast.error("Vui lòng nhập tên bài học");

    setIsSaving(true);
    const token = Cookies.get("token");

    try {
      const res = await fetch("http://localhost:3001/api/v1/admin/generator/save", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          courseId: selectedCourse,
          lessonTitle,
          examData: draftExam
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");

      toast.success(data.message || "Lưu đề thành công!");
      router.push(`/courses/${selectedCourse}`);
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu đề");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in-up">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <BrainCircuit className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Exam Generator</h1>
          <p className="text-slate-500 mt-1">Tự động sinh đề kiểm tra ngẫu nhiên từ tài liệu mẫu với Gemini 2.5</p>
        </div>
      </div>

      {!draftExam ? (
        <Card className="border-slate-200 overflow-hidden shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle>Tải lên đề mẫu</CardTitle>
            <CardDescription>Hệ thống sẽ phân tích cấu trúc của tệp và sinh ra bản nháp một đề hoàn toàn mới</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Tài liệu tham chiếu (PDF, DOCX, TXT)</label>
              <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors ${file ? 'border-primary/50 bg-primary/5' : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50 bg-white'}`}>
                <div className="space-y-2 text-center flex flex-col items-center">
                  {file ? (
                    <FileText className="h-10 w-10 text-primary mb-2" />
                  ) : (
                    <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
                  )}
                  <div className="flex text-sm text-slate-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 transition-colors focus-within:outline-none">
                      <span>{file ? "Đổi tài liệu khác" : "Tải lên tài liệu mẫu"}</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} disabled={isGenerating} accept=".pdf,.doc,.docx,.txt,.md" />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">
                    {file ? (
                      <span className="font-medium text-slate-700">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                    ) : (
                      "PDF, DOCX, TXT hoặc Markdown nhỏ hơn 20MB"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 border-t border-slate-100 flex justify-between items-center py-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <BrainCircuit className="h-3 w-3" /> Quá trình sinh bằng AI có thể mất 15-30 giây.
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !file}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang phân tích & Sinh bản nháp...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Bắt đầu tạo nháp AI
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-slate-200 overflow-hidden shadow-sm">
            <CardHeader className={draftExam._isFallback ? "bg-amber-50 border-b border-amber-100" : "bg-emerald-50 border-b border-emerald-100"}>
              <CardTitle className={`flex items-center gap-2 ${draftExam._isFallback ? 'text-amber-800' : 'text-emerald-800'}`}>
                <CheckCircle2 className="h-5 w-5" /> 
                {draftExam._isFallback ? "⚠️ Đề mẫu tạm thời (API đang bị rate limit)" : "Đã sinh đề thành công"}
              </CardTitle>
              <CardDescription className={draftExam._isFallback ? "text-amber-700/80" : "text-emerald-700/80"}>
                {draftExam._isFallback 
                  ? "Tất cả Gemini API keys đã hết quota hôm nay. Đây là đề mẫu cố định — hãy thử lại vào ngày mai hoặc thêm API key mới."
                  : "Bạn có thể cấu hình khóa học và lưu lại"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Khóa học đích</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={isSaving}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Chọn khóa học..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Tên bài học kết quả</label>
                <Input 
                  placeholder="Nhập tên bài kiểm tra..." 
                  value={lessonTitle}
                  onChange={e => setLessonTitle(e.target.value)}
                  disabled={isSaving}
                  className="bg-white"
                />
              </div>

              <div className="mt-8 border border-slate-200 rounded-lg bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-800 mb-4">{draftExam.title || "Review Đề Thi Sinh Bởi AI"}</h3>
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                  {(draftExam.questions || []).map((q: any, i: number) => (
                    <div key={i} className="bg-white p-4 rounded border border-slate-200 shadow-sm">
                      <p className="font-medium text-slate-800 mb-3"><span className="text-slate-500 mr-2">Câu {i + 1}:</span>{q.content}</p>
                      <div className="space-y-2 pl-4">
                        {(q.options || []).map((opt: any, j: number) => (
                          <div key={j} className={`flex items-start gap-2 text-sm p-2 rounded ${opt.isCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'text-slate-600'}`}>
                            <div className="font-bold flex-shrink-0">{String.fromCharCode(65 + j)}.</div>
                            <div>{opt.content}</div>
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                          <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-500">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t border-slate-100 flex justify-between items-center py-4">
              <Button variant="ghost" onClick={() => setDraftExam(null)} disabled={isSaving}>
                Làm lại từ đầu
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || !selectedCourse || !lessonTitle}
                className="gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Lưu vào Cơ sở dữ liệu"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
