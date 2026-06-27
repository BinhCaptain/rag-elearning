"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PlayCircle, FileText, Youtube, ListChecks, Plus, Trash, CheckCircle2, Loader2, Upload, X, Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CreateLessonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  initialData?: {
    id: string;
    title: string;
    content?: string;
    videoUrl?: string;
    order?: number;
  } | null;
}

export function CreateLessonModal({ open, onOpenChange, courseId, initialData }: CreateLessonModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "video" | "content" | "quiz">("info");
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    videoUrl: initialData?.videoUrl || "",
    order: initialData?.order || 1,
  });

  const [questions, setQuestions] = useState<{
    content: string;
    explanation: string;
    options: { content: string; isCorrect: boolean }[];
  }[]>([]);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content || "",
        videoUrl: initialData.videoUrl || "",
        order: initialData.order || 1,
      });
      // Fetch quiz data if exists
      fetchQuizData(initialData.id);
    } else {
      setFormData({ title: "", content: "", videoUrl: "", order: 1 });
      setQuestions([]);
    }
    setActiveTab("info");
  }, [initialData, open]);

  const fetchQuizData = async (lessonId: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/v1/quizzes?lessonId=${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const quiz = data[0];
          setQuestions(quiz.questions.map((q: any) => ({
            content: q.content,
            explanation: q.explanation || "",
            options: q.options.map((o: any) => ({
              content: o.content,
              isCorrect: o.isCorrect
            }))
          })));
        } else {
          setQuestions([]);
        }
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
    }
  };

  const uploadVideoFile = (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Kích thước video vượt quá giới hạn 100MB");
      return;
    }
    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska", "video/x-msvideo"];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|mkv|avi)$/i)) {
      toast.error("Định dạng file không được hỗ trợ. Vui lòng chọn file .mp4, .webm, .mov, .mkv hoặc .avi");
      return;
    }

    setSelectedFile(file);
    setUploadingVideo(true);
    setUploadProgress(0);

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const pct = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(pct);
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        setFormData((prev) => ({ ...prev, videoUrl: data.url }));
        setSelectedFile(null);
        toast.success("Tải video lên thành công!");
      } else {
        toast.error("Có lỗi xảy ra khi tải video lên.");
      }
      setUploadingVideo(false);
      setUploadProgress(0);
    });
    xhr.addEventListener("error", () => {
      toast.error("Mất kết nối khi tải video lên.");
      setUploadingVideo(false);
      setUploadProgress(0);
    });
    xhr.open("POST", "http://localhost:3001/api/v1/lessons/upload-video");
    xhr.send(formDataUpload);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadVideoFile(file);
  };

  const handleVideoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadVideoFile(file);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        content: "",
        explanation: "",
        options: [
          { content: "Đáp án A", isCorrect: true },
          { content: "Đáp án B", isCorrect: false },
          { content: "Đáp án C", isCorrect: false },
          { content: "Đáp án D", isCorrect: false },
        ],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex: number, oIndex: number, field: string, value: any) => {
    const newQuestions = [...questions];
    const newOptions = [...newQuestions[qIndex].options];
    
    if (field === "isCorrect" && value === true) {
      // Only one correct option per question
      newOptions.forEach((o, i) => o.isCorrect = i === oIndex);
    } else {
      newOptions[oIndex] = { ...newOptions[oIndex], [field]: value };
    }
    
    newQuestions[qIndex].options = newOptions;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isEditing = !!initialData;
      const url = isEditing
        ? `http://localhost:3001/api/v1/lessons/${initialData.id}`
        : "http://localhost:3001/api/v1/lessons";

      const payload = {
        title: formData.title,
        content: formData.content || undefined,
        videoUrl: formData.videoUrl || undefined,
        courseId,
        order: Number(formData.order),
        quiz: questions.length > 0 ? {
          title: `Quiz for ${formData.title}`,
          questions: questions.map(q => ({
            content: q.content,
            explanation: q.explanation,
            options: q.options
          }))
        } : undefined
      };

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(isEditing ? "Failed to update lesson" : "Failed to create lesson");

      toast.success(isEditing ? "Cập nhật bài học thành công!" : "Bài học đã được tạo thành công!");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi lưu bài học.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "info" as const, label: "Thông tin", icon: FileText },
    { id: "video" as const, label: "Video bài giảng", icon: Youtube },
    { id: "content" as const, label: "Nội dung văn bản", icon: PlayCircle },
    { id: "quiz" as const, label: "Trắc nghiệm", icon: ListChecks },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData ? "Chỉnh sửa bài học" : "Thêm bài học mới"}</DialogTitle>
            <DialogDescription>
              Thêm nội dung đa dạng: video bài giảng, bài đọc văn bản, tài liệu...
            </DialogDescription>
          </DialogHeader>

          {/* Tab Bar */}
          <div className="flex gap-1 mt-4 mb-2 p-1 bg-slate-100 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-4 space-y-4">
            {/* Tab: Info */}
            {activeTab === "info" && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Tên bài học <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    placeholder="Nhập tên bài học..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="order">Thứ tự bài học</Label>
                  <Input
                    id="order"
                    type="number"
                    min="1"
                    placeholder="Ví dụ: 1, 2, 3..."
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
            )}

            {/* Tab: Video */}
            {activeTab === "video" && (
              <div className="space-y-4">
                {/* Section 1: URL input */}
                <div className="grid gap-2">
                  <Label htmlFor="videoUrl">URL Video (YouTube, Vimeo...)</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    disabled={uploadingVideo}
                  />
                  <p className="text-xs text-slate-500">
                    Dán link YouTube hoặc Vimeo vào đây. Hệ thống sẽ tự động nhúng video vào bài học.
                  </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Hoặc tải file từ máy</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Section 2: Drag & Drop upload zone */}
                {!uploadingVideo ? (
                  <label
                    htmlFor="video-file-input"
                    className={`flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
                      dragOver
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleVideoDrop}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                      <Upload className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700">Kéo & thả video vào đây</p>
                      <p className="text-xs text-slate-400 mt-1">hoặc click để chọn file từ máy tính</p>
                    </div>
                    <p className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                      .mp4, .mov, .webm, .mkv, .avi · Tối đa 100MB
                    </p>
                    <input
                      id="video-file-input"
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,.mp4,.webm,.mov,.mkv,.avi"
                      className="hidden"
                      onChange={handleVideoUpload}
                    />
                  </label>
                ) : (
                  /* Upload progress UI */
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 shrink-0">
                        <Film className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{selectedFile?.name}</p>
                        <p className="text-xs text-slate-400">
                          {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(1) : 0} MB
                        </p>
                      </div>
                      <div className="text-sm font-bold text-blue-600 shrink-0">{uploadProgress}%</div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-blue-500 flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Đang tải video lên server... Vui lòng không đóng cửa sổ này.
                    </p>
                  </div>
                )}

                {/* Video preview */}
                {formData.videoUrl && !uploadingVideo && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-slate-500">Xem trước video</Label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, videoUrl: "" })}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-3 w-3" /> Xóa video
                      </button>
                    </div>
                    <div className="rounded-xl overflow-hidden bg-slate-900 aspect-video">
                      {formData.videoUrl.includes('/uploads/') ||
                       formData.videoUrl.match(/\.(mp4|webm|mov|mkv|avi)$/i) ? (
                        <video
                          key={formData.videoUrl}
                          src={formData.videoUrl}
                          className="w-full h-full"
                          controls
                        />
                      ) : (
                        <iframe
                          src={getEmbedUrl(formData.videoUrl)}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </div>
                  </div>
                )}

                {!formData.videoUrl && !uploadingVideo && (
                  <div className="flex flex-col items-center justify-center py-4 text-slate-400 gap-1">
                    <Youtube className="h-8 w-8 opacity-20" />
                    <p className="text-xs">Chưa có video. Nhập URL hoặc tải file lên để xem trước.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Content */}
            {activeTab === "content" && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="content">Nội dung bài học (Hỗ trợ Markdown)</Label>
                  <Textarea
                    id="content"
                    placeholder="Nhập nội dung lý thuyết, bài đọc, từ vựng..."
                    className="min-h-[250px] resize-y"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                  <p className="text-xs text-slate-500">
                    Hỗ trợ định dạng Markdown (**, *, #). Nội dung này sẽ được cung cấp cho AI Trợ giảng làm tài liệu tham khảo.
                  </p>
                </div>
              </div>
            )}

            {/* Tab: Quiz */}
            {activeTab === "quiz" && (
              <div className="space-y-6 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Câu hỏi trắc nghiệm</h4>
                    <p className="text-xs text-slate-500">Tạo các câu hỏi kiểm tra kiến thức cho bài học này.</p>
                  </div>
                  <Button type="button" size="sm" onClick={addQuestion} className="gap-2">
                    <Plus className="h-4 w-4" /> Thêm câu hỏi
                  </Button>
                </div>

                {questions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 gap-2">
                    <ListChecks className="h-10 w-10 opacity-20" />
                    <p className="text-sm">Chưa có câu hỏi nào</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {questions.map((question, qIndex) => (
                      <div key={qIndex} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4 relative group">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon-sm" 
                          className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeQuestion(qIndex)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">Câu {qIndex + 1}</Badge>
                        </div>

                        <div className="grid gap-2">
                          <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nội dung câu hỏi</Label>
                          <Input
                            placeholder="Nhập câu hỏi..."
                            value={question.content}
                            onChange={(e) => updateQuestion(qIndex, "content", e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${option.isCorrect ? "border-green-200 bg-green-50/50" : "border-slate-100 bg-slate-50/30"}`}>
                              <button
                                type="button"
                                onClick={() => updateOption(qIndex, oIndex, "isCorrect", true)}
                                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  option.isCorrect 
                                    ? "bg-green-500 border-green-500 text-white" 
                                    : "bg-white border-slate-200 text-transparent"
                                }`}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <Input
                                className="h-8 border-none bg-transparent shadow-none px-0 focus-visible:ring-0 text-sm"
                                placeholder={`Đáp án ${String.fromCharCode(65 + oIndex)}`}
                                value={option.content}
                                onChange={(e) => updateOption(qIndex, oIndex, "content", e.target.value)}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-2">
                          <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Giải thích (Không bắt buộc)</Label>
                          <Input
                            className="text-sm bg-slate-50/50 border-none"
                            placeholder="Giải thích tại sao đáp án này đúng..."
                            value={question.explanation}
                            onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim()}>
              {loading ? "Đang lưu..." : "Lưu bài học"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // YouTube
    if (parsed.hostname.includes("youtube.com") && parsed.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    }
    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    // Vimeo
    if (parsed.hostname.includes("vimeo.com")) {
      return `https://player.vimeo.com/video${parsed.pathname}`;
    }
    return url;
  } catch {
    return url;
  }
}
