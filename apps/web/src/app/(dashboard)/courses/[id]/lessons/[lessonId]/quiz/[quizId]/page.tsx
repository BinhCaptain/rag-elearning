"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ArrowRight, BrainCircuit, RotateCcw, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";

interface Option {
  id: string;
  content: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  content: string;
  explanation: string | null;
  options: Option[];
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { id: courseId, lessonId, quizId } = params;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`http://localhost:3001/api/v1/quizzes/${quizId}`);
        if (res.ok) {
          const data = await res.json();
          setQuiz(data);
        }
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quiz) {
    return <div className="p-8 text-center text-slate-500">Không tìm thấy bài trắc nghiệm.</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / quiz.questions.length) * 100;
  
  const handleOptionSelect = (optionId: string) => {
    if (showResult) return;
    setSelectedOptionId(optionId);
  };

  const handleCheck = () => {
    if (!selectedOptionId) return;
    setAnswers({ ...answers, [currentQuestion.id]: selectedOptionId });
    setShowResult(true);
  };

  const handleNext = async () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptionId(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
      try {
        const token = Cookies.get("token");
        const answersArray = quiz.questions.map(q => answers[q.id] || "");
        
        const res = await fetch(`http://localhost:3001/api/v1/quizzes/${quizId}/submit`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ answers: answersArray }),
        });

        if (!res.ok) throw new Error("Nộp bài thất bại");
        
        const result = await res.json();
        toast.success(`Nộp bài thành công! Bạn đạt ${result.score}/${result.totalQuestions}`);
        router.refresh();
      } catch (err) {
        console.error("Lỗi nộp bài trắc nghiệm", err);
        toast.error("Không thể ghi lại kết quả bài tập. Vui lòng thử lại.");
      }
    }
  };

  const calculateScore = () => {
    let score = 0;
    quiz.questions.forEach((q) => {
      const correctOption = q.options.find((o) => o.isCorrect);
      if (correctOption && answers[q.id] === correctOption.id) {
        score++;
      }
    });
    return score;
  };

  if (isFinished) {
    const score = calculateScore();
    const passed = score / quiz.questions.length >= 0.8;

    return (
      <div className="max-w-2xl mx-auto py-12 animate-fade-in-up">
        <Card className="border-none shadow-2xl glass-effect overflow-hidden rounded-3xl">
          <div className={`p-8 text-center ${passed ? 'bg-emerald-500' : 'bg-amber-500'} text-white`}>
            {passed ? (
               <CheckCircle2 className="h-20 w-20 mx-auto mb-4 animate-bounce" />
            ) : (
               <BrainCircuit className="h-20 w-20 mx-auto mb-4 animate-pulse" />
            )}
            <h1 className="text-3xl font-extrabold mb-2">
              {passed ? "Tuyệt vời!" : "Cố gắng thêm chút nữa!"}
            </h1>
            <p className="text-white/80 font-medium">Bạn đã hoàn thành bài kiểm tra.</p>
          </div>
          <CardContent className="p-10 space-y-8">
            <div className="flex justify-center gap-12">
               <div className="text-center">
                  <span className="block text-4xl font-black text-slate-900">{score}</span>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đúng</span>
               </div>
               <div className="text-center">
                  <span className="block text-4xl font-black text-slate-900">{quiz.questions.length}</span>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tổng câu</span>
               </div>
               <div className="text-center">
                  <span className="block text-4xl font-black text-slate-900">{Math.round((score / quiz.questions.length) * 100)}%</span>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Điểm số</span>
               </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href={`/courses/${courseId}/lessons/${lessonId}`} className="w-full">
                <Button className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20">
                  Tiếp tục học bài mới
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full h-14 text-lg font-bold rounded-2xl"
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                  setIsFinished(false);
                  setSelectedOptionId(null);
                  setShowResult(false);
                }}
              >
                <RotateCcw className="mr-2 h-5 w-5" /> Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in-up">
      <div className="mb-8 flex items-center justify-between">
        <Link href={`/courses/${courseId}/lessons/${lessonId}`} className="text-sm font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
           <ChevronLeft className="h-4 w-4" /> Quay lại bài học
        </Link>
        <Badge variant="outline" className="font-bold py-1 px-3 rounded-full border-primary/20 text-primary">
          Câu {currentQuestionIndex + 1} / {quiz.questions.length}
        </Badge>
      </div>

      <Progress value={progress} className="h-2 mb-8 bg-slate-200" />

      <Card className="border-none shadow-xl border-slate-200 rounded-3xl overflow-hidden glass-effect">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-2xl font-bold text-slate-900 leading-tight">
            {currentQuestion.content}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-4">
          <div className="grid gap-4">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const isCorrect = option.isCorrect;
              const hasAnswered = showResult;

              let borderStyles = "border-slate-200 hover:border-primary/50 bg-white";
              let icon = null;

              if (hasAnswered) {
                if (isCorrect) {
                  borderStyles = "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20";
                  icon = <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
                } else if (isSelected) {
                  borderStyles = "border-red-500 bg-red-50 text-red-900 ring-2 ring-red-500/20";
                  icon = <XCircle className="h-5 w-5 text-red-600" />;
                } else {
                  borderStyles = "border-slate-100 bg-slate-50/50 text-slate-400 opacity-60";
                }
              } else if (isSelected) {
                borderStyles = "border-primary bg-primary/5 ring-2 ring-primary/20";
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={hasAnswered}
                  className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 text-left font-semibold ${borderStyles}`}
                >
                  <span className="flex-1">{option.content}</span>
                  {icon}
                </button>
              );
            })}
          </div>

          {showResult && currentQuestion.explanation && (
            <div className="mt-6 p-6 rounded-2xl bg-primary/5 border border-primary/10 animate-fade-in">
               <div className="flex items-center gap-2 mb-2">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  <span className="font-bold text-primary text-sm uppercase tracking-wider">Giải thích từ AI</span>
               </div>
               <p className="text-slate-700 leading-relaxed italic text-sm">
                 {currentQuestion.explanation}
               </p>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            {!showResult ? (
              <Button 
                onClick={handleCheck} 
                disabled={!selectedOptionId}
                className="h-14 px-10 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20"
              >
                Kiểm tra đáp án
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                className="h-14 px-10 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 group"
              >
                {currentQuestionIndex < quiz.questions.length - 1 ? "Tiếp tục" : "Xem kết quả"}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
