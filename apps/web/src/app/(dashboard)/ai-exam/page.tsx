"use client";

import { useState, useRef } from "react";
import {
  BrainCircuit, UploadCloud, FileText, Loader2, Sparkles,
  CheckCircle2, Download, Printer, RefreshCw, ChevronRight,
  BarChart3, Settings2, Eye, AlertTriangle, X, Plus, Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Cookies from "js-cookie";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClassifiedQuestion {
  id: number;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  answer?: string;
  category: string;
  difficulty: string;
  confidence: number;
}

interface AnalysisResult {
  id: string;
  fileName: string;
  totalQuestions: number;
  categories: Record<string, number>;
  questions: ClassifiedQuestion[];
}

interface GeneratedQuestion {
  number: number;
  category: string;
  difficulty: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  answer?: string;
  explanation?: string;
}

interface GeneratedExam {
  title: string;
  totalQuestions: number;
  questions: GeneratedQuestion[];
  _isFallback?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  "Vocabulary": "bg-violet-100 text-violet-700 border-violet-200",
  "Grammar": "bg-blue-100 text-blue-700 border-blue-200",
  "Reading Comprehension": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Pronunciation": "bg-orange-100 text-orange-700 border-orange-200",
  "Error Correction": "bg-red-100 text-red-700 border-red-200",
  "Cloze Test": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "Other": "bg-slate-100 text-slate-600 border-slate-200",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  "Easy": "text-emerald-600 bg-emerald-50",
  "Medium": "text-amber-600 bg-amber-50",
  "Hard": "text-red-600 bg-red-50",
};

const STEPS = ["Upload", "Analysis", "Configure", "Preview & Export"];

// ─── Utility ─────────────────────────────────────────────────────────────────

function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS["Other"];
}

function pct(n: number, total: number) {
  if (total === 0) return "0";
  return ((n / total) * 100).toFixed(1);
}

function exportTxt(exam: GeneratedExam, includeAnswers: boolean) {
  let text = `${exam.title}\n${"=".repeat(exam.title.length)}\n\n`;
  exam.questions.forEach((q, i) => {
    text += `Câu ${i + 1}: [${q.category}] ${q.question}\n`;
    text += `A. ${q.options.A}\n`;
    text += `B. ${q.options.B}\n`;
    text += `C. ${q.options.C}\n`;
    text += `D. ${q.options.D}\n`;
    if (includeAnswers && q.answer) text += `Đáp án: ${q.answer}\n`;
    if (q.explanation) text += `Giải thích: ${q.explanation}\n`;
    text += "\n";
  });
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${exam.title.replace(/\s+/g, "_")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportDocx(exam: GeneratedExam, includeAnswers: boolean) {
  // Generate Word-compatible HTML saved as .doc
  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><title>${exam.title}</title>
<style>
  body { font-family: Times New Roman, serif; font-size: 13pt; margin: 2cm; }
  h1 { text-align: center; font-size: 16pt; }
  .question { margin-bottom: 16pt; }
  .options { margin-left: 20pt; }
  .answer { color: green; font-style: italic; }
  .cat { color: #555; font-size: 10pt; }
</style></head><body>
<h1>${exam.title}</h1><br/>`;

  exam.questions.forEach((q, i) => {
    html += `<div class="question">
<p><b>Câu ${i + 1}.</b> <span class="cat">[${q.category}]</span> ${q.question}</p>
<div class="options">
<p>A. ${q.options.A}</p>
<p>B. ${q.options.B}</p>
<p>C. ${q.options.C}</p>
<p>D. ${q.options.D}</p>
</div>`;
    if (includeAnswers && q.answer) html += `<p class="answer">Đáp án: ${q.answer}${q.explanation ? ` — ${q.explanation}` : ""}</p>`;
    html += `</div>`;
  });
  html += `</body></html>`;

  const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${exam.title.replace(/\s+/g, "_")}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-1 flex-1 last:flex-none">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${i === step ? "bg-blue-600 text-white shadow-md" : i < step ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i === step ? "bg-white/20" : i < step ? "bg-blue-200" : "bg-slate-200"}`}>
              {i < step ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
            </span>
            {label}
          </div>
          {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-1 ${i < step ? "bg-blue-300" : "bg-slate-200"}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIExamPage() {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Config state
  const [editedCategories, setEditedCategories] = useState<Record<string, number>>({});
  const [totalQuestions, setTotalQuestions] = useState(50);
  const [difficulty, setDifficulty] = useState("Medium");
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [avoidDuplicates, setAvoidDuplicates] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<GeneratedExam | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = Cookies.get("token");

  // ─── File handling ──────────────────────────────────────────────────────────

  function handleFile(f: File) {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["txt", "pdf", "doc", "docx", "md"].includes(ext || "")) {
      toast.error("Chỉ hỗ trợ .txt, .pdf, .doc, .docx, .md");
      return;
    }
    setFile(f);
  }

  async function handleAnalyze() {
    if (!file) return toast.error("Vui lòng chọn file");
    setIsAnalyzing(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("http://localhost:3001/api/v1/admin/generator/analyze-sample", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Phân tích thất bại");

      setAnalysis(data);
      // Seed editable categories from analysis
      setEditedCategories({ ...data.categories });
      setTotalQuestions(data.totalQuestions);
      setStep(1);
      toast.success(`Phân tích xong ${data.totalQuestions} câu hỏi!`);
    } catch (e: any) {
      toast.error(e.message || "Lỗi phân tích file");
    } finally {
      setIsAnalyzing(false);
    }
  }

  // ─── Configure ─────────────────────────────────────────────────────────────

  function adjustCategory(cat: string, delta: number) {
    setEditedCategories(prev => ({
      ...prev,
      [cat]: Math.max(0, (prev[cat] || 0) + delta),
    }));
  }

  const configuredTotal = Object.values(editedCategories).reduce((s, n) => s + n, 0);

  function syncTotal() {
    // Re-distribute proportionally to match totalQuestions
    if (configuredTotal === 0) return;
    const factor = totalQuestions / configuredTotal;
    const updated: Record<string, number> = {};
    const cats = Object.entries(editedCategories).filter(([, n]) => n > 0);
    let remaining = totalQuestions;
    cats.forEach(([cat], i) => {
      if (i === cats.length - 1) {
        updated[cat] = remaining;
      } else {
        const n = Math.round((editedCategories[cat] / configuredTotal) * totalQuestions);
        updated[cat] = n;
        remaining -= n;
      }
    });
    setEditedCategories(updated);
  }

  // ─── Generate ──────────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!analysis) return;
    setIsGenerating(true);
    try {
      const res = await fetch("http://localhost:3001/api/v1/admin/generator/generate-from-sample", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceAnalysisId: analysis.id,
          totalQuestions: configuredTotal || totalQuestions,
          categories: editedCategories,
          difficulty,
          includeAnswers,
          includeExplanations,
          avoidDuplicates,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Sinh đề thất bại");
      setGeneratedExam(data);
      setStep(3);
      if (data._isFallback) toast.warning("API Gemini đang bị rate limit — đây là đề mẫu tạm thời.");
      else toast.success(`Sinh thành công ${data.totalQuestions} câu hỏi!`);
    } catch (e: any) {
      toast.error(e.message || "Lỗi sinh đề");
    } finally {
      setIsGenerating(false);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-blue-600/10 flex items-center justify-center">
          <BrainCircuit className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Generate Exam from Sample File</h1>
          <p className="text-slate-500 text-sm mt-0.5">Upload đề mẫu → AI phân tích cấu trúc → Sinh đề mới cùng phân phối câu hỏi</p>
        </div>
      </div>

      <StepIndicator step={step} />

      {/* ── STEP 0: UPLOAD ── */}
      {step === 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/60 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2"><UploadCloud className="h-5 w-5 text-blue-500" /> Tải lên file đề mẫu</CardTitle>
            <CardDescription>Hỗ trợ .txt, .pdf, .docx, .md tối đa 20MB. Mỗi câu hỏi cần có số thứ tự (1., Câu 1, ...)</CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <label
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              className={`flex flex-col items-center justify-center gap-4 py-16 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${dragOver ? "border-blue-400 bg-blue-50" : file ? "border-blue-300 bg-blue-50/40" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}
              htmlFor="file-input-main"
            >
              {file ? (
                <>
                  <FileText className="h-12 w-12 text-blue-500" />
                  <div className="text-center">
                    <p className="font-semibold text-slate-800">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button type="button" onClick={e => { e.preventDefault(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"><X className="h-3 w-3" /> Xóa file</button>
                </>
              ) : (
                <>
                  <UploadCloud className="h-12 w-12 text-slate-300" />
                  <div className="text-center">
                    <p className="font-semibold text-slate-600">Kéo & thả file vào đây</p>
                    <p className="text-sm text-slate-400">hoặc click để chọn file từ máy tính</p>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">.txt · .pdf · .docx · .md · Tối đa 20MB</span>
                </>
              )}
              <input ref={fileInputRef} id="file-input-main" type="file" accept=".txt,.pdf,.doc,.docx,.md" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </label>
          </CardContent>
          <CardFooter className="bg-slate-50/60 border-t border-slate-100 flex justify-end py-4">
            <Button onClick={handleAnalyze} disabled={!file || isAnalyzing} className="gap-2 min-w-[160px]">
              {isAnalyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang phân tích...</> : <><BarChart3 className="h-4 w-4" /> Phân tích cấu trúc</>}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* ── STEP 1: ANALYSIS ── */}
      {step === 1 && analysis && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-slate-200 p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{analysis.totalQuestions}</p>
              <p className="text-xs text-slate-500 mt-1">Tổng câu hỏi</p>
            </Card>
            {Object.entries(analysis.categories).map(([cat, n]) => (
              <Card key={cat} className="border-slate-200 p-4">
                <p className="text-2xl font-bold text-slate-800">{n}</p>
                <p className="text-xs text-slate-500 mt-1">{cat}</p>
                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct(n, analysis.totalQuestions)}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{pct(n, analysis.totalQuestions)}%</p>
              </Card>
            ))}
          </div>

          {/* Questions table */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 py-3">
              <CardTitle className="text-sm font-semibold text-slate-700">Chi tiết {analysis.questions.length} câu hỏi đã phân tích</CardTitle>
            </CardHeader>
            <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
              {analysis.questions.map(q => (
                <div key={q.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-slate-400 font-mono w-8 shrink-0 pt-0.5">#{q.id}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 line-clamp-2">{q.question}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getCategoryColor(q.category)}`}>{q.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLOR[q.difficulty] || DIFFICULTY_COLOR["Medium"]}`}>{q.difficulty}</span>
                        <span className="text-xs text-slate-400">{Math.round(q.confidence * 100)}% tin cậy</span>
                        {q.answer && <span className="text-xs text-emerald-600 font-medium">Đáp án: {q.answer}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>← Tải lại file</Button>
            <Button onClick={() => setStep(2)} className="gap-2"><Settings2 className="h-4 w-4" /> Cấu hình đề mới <ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: CONFIGURE ── */}
      {step === 2 && analysis && (
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-blue-500" /> Cấu hình đề thi mới</CardTitle>
              <CardDescription>Điều chỉnh số lượng câu hỏi theo từng phần, độ khó và các tùy chọn khác</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-6">
              {/* Total questions */}
              <div className="flex items-center justify-between gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div>
                  <p className="font-semibold text-slate-800">Tổng số câu hỏi</p>
                  <p className="text-xs text-slate-500">Phân bổ theo tỷ lệ từ đề mẫu</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setTotalQuestions(Math.max(5, totalQuestions - 5))} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-white transition-colors"><Minus className="h-3 w-3" /></button>
                  <span className="text-2xl font-bold text-blue-600 w-12 text-center">{totalQuestions}</span>
                  <button onClick={() => setTotalQuestions(Math.min(200, totalQuestions + 5))} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-white transition-colors"><Plus className="h-3 w-3" /></button>
                  <Button variant="outline" size="sm" onClick={syncTotal} className="ml-2 text-xs">Áp dụng tỷ lệ</Button>
                </div>
              </div>

              {/* Category distribution */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-slate-800">Phân bổ theo loại câu hỏi</p>
                  <span className="text-xs text-slate-500">Tổng: <span className={`font-bold ${configuredTotal !== totalQuestions ? "text-amber-600" : "text-emerald-600"}`}>{configuredTotal}</span> / {totalQuestions}</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(editedCategories).map(([cat, n]) => (
                    <div key={cat} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white transition-colors">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-1 min-w-0 ${getCategoryColor(cat)}`}>{cat}</span>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                        <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${pct(n, configuredTotal || 1)}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 w-10 text-right">{pct(n, configuredTotal || 1)}%</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => adjustCategory(cat, -1)} disabled={n === 0} className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition-colors"><Minus className="h-3 w-3" /></button>
                        <span className="text-sm font-bold text-slate-700 w-6 text-center">{n}</span>
                        <button onClick={() => adjustCategory(cat, 1)} className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <p className="font-semibold text-slate-800 mb-2">Độ khó chung</p>
                <div className="flex gap-2">
                  {["Easy", "Medium", "Hard"].map(d => (
                    <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${difficulty === d ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>{d}</button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: "Có đáp án", desc: "Kèm đáp án đúng", val: includeAnswers, set: setIncludeAnswers },
                  { label: "Có giải thích", desc: "Giải thích đáp án", val: includeExplanations, set: setIncludeExplanations },
                  { label: "Câu hỏi mới", desc: "Không trùng đề mẫu", val: avoidDuplicates, set: setAvoidDuplicates },
                ].map(opt => (
                  <button key={opt.label} onClick={() => opt.set(!opt.val)} className={`p-3 rounded-xl border text-left transition-all ${opt.val ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${opt.val ? "border-blue-500 bg-blue-500" : "border-slate-300"}`}>
                        {opt.val && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm font-semibold ${opt.val ? "text-blue-700" : "text-slate-700"}`}>{opt.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 pl-6">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {configuredTotal !== totalQuestions && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Tổng phân bổ ({configuredTotal}) khác với số câu mong muốn ({totalQuestions}). AI sẽ sinh {configuredTotal} câu theo phân bổ hiện tại.
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-slate-50/60 border-t border-slate-100 flex justify-between py-4">
              <Button variant="outline" onClick={() => setStep(1)}>← Xem lại phân tích</Button>
              <Button onClick={handleGenerate} disabled={isGenerating || configuredTotal === 0} className="gap-2 min-w-[180px]">
                {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang sinh đề AI...</> : <><Sparkles className="h-4 w-4" /> Sinh đề thi mới</>}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ── STEP 3: PREVIEW & EXPORT ── */}
      {step === 3 && generatedExam && (
        <div className="space-y-4">
          {/* Header card */}
          <Card className={`border shadow-sm overflow-hidden ${generatedExam._isFallback ? "border-amber-200" : "border-emerald-200"}`}>
            <CardHeader className={generatedExam._isFallback ? "bg-amber-50 border-b border-amber-100" : "bg-emerald-50 border-b border-emerald-100"}>
              <CardTitle className={`flex items-center gap-2 ${generatedExam._isFallback ? "text-amber-800" : "text-emerald-800"}`}>
                {generatedExam._isFallback ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                {generatedExam._isFallback ? "Đề mẫu tạm thời (API rate-limited)" : `Đã sinh thành công ${generatedExam.totalQuestions} câu hỏi`}
              </CardTitle>
              {!generatedExam._isFallback && (
                <CardDescription className="text-emerald-700/80">{generatedExam.title}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="py-4">
              {/* Export buttons */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => exportTxt(generatedExam, includeAnswers)} className="gap-2">
                  <Download className="h-4 w-4" /> Tải về TXT
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportDocx(generatedExam, includeAnswers)} className="gap-2">
                  <Download className="h-4 w-4" /> Tải về DOCX
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
                  <Printer className="h-4 w-4" /> In / Xuất PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Questions preview */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 py-3 flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Eye className="h-4 w-4" /> Xem trước đề thi</CardTitle>
              <span className="text-xs text-slate-400">{generatedExam.questions?.length || 0} câu hỏi</span>
            </CardHeader>
            <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100 print:max-h-none print:overflow-visible">
              {(generatedExam.questions || []).map((q, i) => (
                <div key={i} className="px-5 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-sm font-bold text-slate-500 shrink-0 w-8">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getCategoryColor(q.category)}`}>{q.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLOR[q.difficulty] || DIFFICULTY_COLOR["Medium"]}`}>{q.difficulty}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800">{q.question}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pl-11">
                    {(["A", "B", "C", "D"] as const).map(opt => (
                      <div key={opt} className={`flex items-start gap-2 text-sm p-2 rounded-lg ${includeAnswers && q.answer === opt ? "bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium" : "text-slate-600 border border-transparent"}`}>
                        <span className="font-bold shrink-0">{opt}.</span>
                        <span>{q.options[opt]}</span>
                      </div>
                    ))}
                  </div>
                  {includeExplanations && q.explanation && (
                    <div className="mt-2 pl-11 pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500 italic">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>← Cấu hình lại</Button>
            <Button variant="outline" onClick={() => { setStep(0); setFile(null); setAnalysis(null); setGeneratedExam(null); }} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Tạo đề mới từ đầu
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
