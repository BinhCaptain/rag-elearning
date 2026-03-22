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
import { PlayCircle, FileText, Youtube } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"info" | "video" | "content">("info");
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    videoUrl: initialData?.videoUrl || "",
    order: initialData?.order || 1,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content || "",
        videoUrl: initialData.videoUrl || "",
        order: initialData.order || 1,
      });
    } else {
      setFormData({ title: "", content: "", videoUrl: "", order: 1 });
    }
    setActiveTab("info");
  }, [initialData, open]);

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
                <div className="grid gap-2">
                  <Label htmlFor="videoUrl">URL Video (YouTube, Vimeo...)</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  />
                  <p className="text-xs text-slate-500">
                    Dán link YouTube hoặc Vimeo vào đây. Hệ thống sẽ tự động nhúng video vào bài học.
                  </p>
                </div>

                {formData.videoUrl && (
                  <div className="rounded-xl overflow-hidden bg-slate-900 aspect-video">
                    <iframe
                      src={getEmbedUrl(formData.videoUrl)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {!formData.videoUrl && (
                  <div className="flex flex-col items-center justify-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 gap-3">
                    <Youtube className="h-12 w-12 opacity-30" />
                    <p className="text-sm font-medium">Nhập URL video để xem bản xem trước</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Content */}
            {activeTab === "content" && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="content">Nội dung bài học (Văn bản / Markdown)</Label>
                  <Textarea
                    id="content"
                    placeholder="Nhập nội dung bài học, tài liệu đọc, ghi chú giảng viên...

Bạn có thể dùng Markdown:
# Tiêu đề lớn
## Tiêu đề nhỏ
**in đậm**, *in nghiêng*
- Danh sách gạch đầu dòng"
                    className="min-h-[200px] font-mono text-sm"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                  <p className="text-xs text-slate-500">Hỗ trợ Markdown cơ bản.</p>
                </div>
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
