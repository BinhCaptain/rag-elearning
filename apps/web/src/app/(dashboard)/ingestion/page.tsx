"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, FileType, Search, Hash } from "lucide-react";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function IngestionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Vui lòng chọn một file PDF.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    if (topic) formData.append("topic", topic);
    if (level) formData.append("level", level);

    try {
      const res = await fetch("http://localhost:3001/api/v1/ingestion/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Tải lên thất bại");
      }

      toast.success("Tải lên và xử lý tài liệu AI thành công!");
      setFile(null);
      setTopic("");
      setLevel("");
      // Reset input element
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xử lý tài liệu.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`http://localhost:3001/api/v1/ingestion/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error(error);
      toast.error("Tìm kiếm thất bại");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in-up h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-none">Quản lý Tài liệu AI</h1>
          <p className="text-slate-500 mt-2">Vectorize và quản lý nguồn dữ liệu RAG cho Chatbot AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-effect shadow-xl border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Upload className="h-5 w-5" /> Tải lên tài liệu mới
            </CardTitle>
            <CardDescription>Hỗ trợ định dạng file PDF để phân giải và nạp vào Vector Database.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid w-full items-center gap-1.5">
              <label htmlFor="file-upload" className="text-sm font-medium text-slate-700">Tệp PDF định dạng chuẩn</label>
              <Input id="file-upload" type="file" accept="application/pdf" onChange={handleFileChange} disabled={isUploading} className="cursor-pointer file:cursor-pointer" />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div className="grid w-full items-center gap-1.5">
                  <label htmlFor="topic" className="text-sm font-medium text-slate-700">Chủ đề (Topic)</label>
                  <Input id="topic" placeholder="vd: Thì hiện tại đơn" value={topic} onChange={(e) => setTopic(e.target.value)} disabled={isUploading} />
               </div>
               <div className="grid w-full items-center gap-1.5">
                  <label htmlFor="level" className="text-sm font-medium text-slate-700">Cấp độ (Level)</label>
                  <Input id="level" placeholder="vd: Cơ bản, Nâng cao" value={level} onChange={(e) => setLevel(e.target.value)} disabled={isUploading} />
               </div>
             </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full gap-2" size="lg" onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              {isUploading ? "Đang xử lý & nhúng (embedding)..." : "Bắt đầu tải lên & Nạp"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-white flex flex-col">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-slate-500" />
                Kiểm tra kiến thức Vector
             </CardTitle>
           </CardHeader>
           <CardContent className="flex-1 flex flex-col space-y-4">
              <div className="flex gap-2">
                 <Input 
                   placeholder="Nhập truy vấn để tìm kiếm Chunk..." 
                   value={query} 
                   onChange={(e) => setQuery(e.target.value)} 
                   onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                   disabled={isSearching} 
                 />
                 <Button onClick={handleSearch} disabled={!query.trim() || isSearching}>
                   {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                 </Button>
              </div>

              <div className="flex-1 p-4 rounded-xl border border-slate-100 bg-slate-50 overflow-y-auto max-h-[300px] space-y-3">
                 {searchResults.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                       Chưa có kết quả truy vấn.
                    </div>
                 ) : (
                    searchResults.map((result, i) => (
                       <div key={result.id || i} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                             <Badge variant="outline" className="text-xs bg-slate-50 text-emerald-600 border-emerald-200">Score: {Math.round(result.score * 100)}%</Badge>
                             {(result.topic || result.level) && (
                                <div className="flex gap-1 text-[10px] text-slate-400 font-medium">
                                  {result.topic && <span className="bg-slate-100 px-1.5 py-0.5 rounded">{result.topic}</span>}
                                  {result.level && <span className="bg-slate-100 px-1.5 py-0.5 rounded">{result.level}</span>}
                                </div>
                             )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-mono whitespace-pre-wrap line-clamp-4">
                             {result.text}
                          </p>
                       </div>
                    ))
                 )}
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
