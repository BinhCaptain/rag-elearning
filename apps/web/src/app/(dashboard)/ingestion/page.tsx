"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, FileType, Search, Hash, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function IngestionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const token = Cookies.get("token");
      const res = await fetch("http://localhost:3001/api/v1/ingestion", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách tài liệu:", error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này cùng toàn bộ các vector RAG tương ứng?")) return;

    try {
      const token = Cookies.get("token");
      const res = await fetch(`http://localhost:3001/api/v1/ingestion/${docId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("Xóa tài liệu thất bại");
      
      toast.success("Xóa tài liệu thành công!");
      fetchDocuments();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xóa tài liệu.");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Vui lòng chọn một file tài liệu hợp lệ.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    if (topic) formData.append("topic", topic);
    if (level) formData.append("level", level);

    try {
      const token = Cookies.get("token");
      const res = await fetch("http://localhost:3001/api/v1/ingestion/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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
      fetchDocuments();
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
      const token = Cookies.get("token");
      const res = await fetch(`http://localhost:3001/api/v1/ingestion/search?q=${encodeURIComponent(query)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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
        <div className="space-y-6">
          <Card className="glass-effect shadow-xl border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Upload className="h-5 w-5" /> Tải lên tài liệu mới
              </CardTitle>
              <CardDescription>Hỗ trợ định dạng file PDF, DOCX, DOC, TXT, MD để phân giải và nạp vào Vector Database.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid w-full items-center gap-1.5">
                <label htmlFor="file-upload" className="text-sm font-medium text-slate-700">Tệp tài liệu (PDF, Word, Txt, Markdown)</label>
                <Input id="file-upload" type="file" accept=".pdf,.docx,.doc,.txt,.md" onChange={handleFileChange} disabled={isUploading} className="cursor-pointer file:cursor-pointer" />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="grid w-full items-center gap-1.5">
                    <label htmlFor="topic" className="text-sm font-medium text-slate-700">Chủ đề (Topic)</label>
                    <Input id="topic" placeholder="vd: Từ vựng y dược" value={topic} onChange={(e) => setTopic(e.target.value)} disabled={isUploading} />
                 </div>
                 <div className="grid w-full items-center gap-1.5">
                    <label htmlFor="level" className="text-sm font-medium text-slate-700">Cấp độ (Level)</label>
                    <Input id="level" placeholder="vd: Nâng cao, Chuyên ngành" value={level} onChange={(e) => setLevel(e.target.value)} disabled={isUploading} />
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

          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="py-4">
              <CardTitle className="text-slate-800 text-lg flex items-center gap-2">
                <FileType className="h-5 w-5 text-blue-500" />
                Tài liệu đã nạp vào RAG
              </CardTitle>
              <CardDescription className="text-xs">
                Danh sách tài liệu đã được phân tích và lưu trữ trong cơ sở dữ liệu.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              {isLoadingDocs ? (
                <div className="py-8 flex justify-center text-slate-400 text-sm gap-2 items-center">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  Đang tải danh sách...
                </div>
              ) : documents.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  Chưa nạp tài liệu nào.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                  {documents.map((doc) => (
                    <div key={doc._id} className="py-2.5 flex items-start justify-between gap-3 group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <p className="text-xs font-semibold text-slate-700 truncate" title={doc.originalName}>
                            {doc.originalName}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0.5 border-none font-bold ${
                            doc.status === 'DONE' ? 'bg-emerald-50 text-emerald-700' :
                            doc.status === 'PROCESSING' || doc.status === 'PENDING' ? 'bg-blue-50 text-blue-700' :
                            'bg-red-50 text-red-700'
                          }`}>
                            {doc.status === 'DONE' ? 'Hoàn tất' : doc.status === 'PROCESSING' ? 'Đang xử lý' : doc.status === 'PENDING' ? 'Chờ xử lý' : 'Lỗi'}
                          </Badge>
                          <span className="text-[10px] text-slate-400">{doc.chunk_count} chunks</span>
                          {doc.topic && <span className="bg-slate-50 text-[10px] text-slate-400 px-1 py-0.5 rounded border border-slate-100">{doc.topic}</span>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc._id)}
                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0 opacity-80 hover:opacity-100"
                        title="Xóa tài liệu"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
