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
import { Plus, Trash, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OptionProps {
  content: string;
  isCorrect: boolean;
}

interface QuestionProps {
  content: string;
  explanation: string;
  options: OptionProps[];
}

interface CreateQuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
}

export function CreateQuizModal({ open, onOpenChange, lessonId }: CreateQuizModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionProps[]>([
    {
      content: "",
      explanation: "",
      options: [
        { content: "", isCorrect: true },
        { content: "", isCorrect: false }
      ]
    }
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions, 
      {
        content: "",
        explanation: "",
        options: [
          { content: "", isCorrect: true },
          { content: "", isCorrect: false }
        ]
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index: number, field: keyof QuestionProps, value: string) => {
    const newQuestions = [...questions];
    (newQuestions[index][field] as any) = value;
    setQuestions(newQuestions);
  };

  const handleAddOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({ content: "", isCorrect: false });
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(oIndex, 1);
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex].content = value;
    setQuestions(newQuestions);
  };

  const handleSetCorrectOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.forEach((opt, idx) => {
      opt.isCorrect = idx === oIndex;
    });
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        lessonId,
        title,
        questions
      };

      const res = await fetch("http://localhost:3001/api/v1/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create quiz");

      toast.success("Bài trắc nghiệm đã được tạo thành công!");
      onOpenChange(false);
      setTitle("");
      setQuestions([{ content: "", explanation: "", options: [{ content: "", isCorrect: true }, { content: "", isCorrect: false }] }]);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi lưu bài trắc nghiệm.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tạo bài Trắc nghiệm / Bài tập mới</DialogTitle>
            <DialogDescription>
              Thêm bài tập đánh giá năng lực cho bài học này.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề bài trắc nghiệm</Label>
              <Input
                id="title"
                placeholder="Ví dụ: Kiểm tra cuối bài 1..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Danh sách câu hỏi</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddQuestion}>
                  <Plus className="h-4 w-4 mr-2" /> Thêm câu hỏi
                </Button>
              </div>

              {questions.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <Label>Câu hỏi {qIndex + 1}</Label>
                      <Textarea 
                        placeholder="Nội dung câu hỏi..." 
                        value={q.content}
                        onChange={(e) => handleQuestionChange(qIndex, 'content', e.target.value)}
                        required
                        className="bg-white min-h-[60px]"
                      />
                    </div>
                    {questions.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="text-red-500 mt-6 shrink-0" onClick={() => handleRemoveQuestion(qIndex)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="pl-4 space-y-3 border-l-2 border-slate-200">
                    <Label className="text-xs text-slate-500">Các đáp án (Nhấp vào icon tick xanh để chọn đáp án đúng)</Label>
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={`shrink-0 ${opt.isCorrect ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-slate-400'}`}
                          onClick={() => handleSetCorrectOption(qIndex, oIndex)}
                        >
                          <CheckCircle2 className={`h-5 w-5 ${opt.isCorrect ? 'fill-emerald-100' : ''}`} />
                        </Button>
                        <Input 
                          placeholder={`Đáp án ${oIndex + 1}`}
                          value={opt.content}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          required
                          className={`bg-white ${opt.isCorrect ? 'border-emerald-500 ring-1 ring-emerald-500' : ''}`}
                        />
                        {q.options.length > 2 && (
                          <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 shrink-0" onClick={() => handleRemoveOption(qIndex, oIndex)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="ghost" size="sm" className="text-xs text-primary mt-2" onClick={() => handleAddOption(qIndex)}>
                      <Plus className="h-3 w-3 mr-1" /> Thêm đáp án
                    </Button>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label className="text-xs text-slate-500">Giải thích đáp án (Optional)</Label>
                    <Textarea 
                      placeholder="Giải thích tại sao đáp án đó là đúng..." 
                      value={q.explanation}
                      onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                      className="bg-white min-h-[60px] text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-slate-100 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu bài trắc nghiệm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
