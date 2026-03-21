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

interface CreateLessonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  initialData?: {
    id: string;
    title: string;
    content?: string;
    order?: number;
  } | null;
}

export function CreateLessonModal({ open, onOpenChange, courseId, initialData }: CreateLessonModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    order: initialData?.order || 1,
  });

  // Update form data when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content || "",
        order: initialData.order || 1,
      });
    } else {
      setFormData({ title: "", content: "", order: 1 });
    }
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
        ...formData,
        courseId,
        order: Number(formData.order) // Ensure it's passed as a number
      };

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(isEditing ? "Failed to update lesson" : "Failed to create lesson");
      }

      toast.success(isEditing ? "Cập nhật bài học thành công!" : "Bài học đã được tạo thành công!");
      onOpenChange(false);
      setFormData({ title: "", content: "", order: 1 });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi lưu bài học.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData ? "Chỉnh sửa bài học" : "Thêm bài học mới"}</DialogTitle>
            <DialogDescription>
              {initialData 
                ? "Chỉnh sửa thông tin chi tiết của bài học. Nhấn lưu khi hoàn tất."
                : "Nhập thông tin chi tiết cho bài học mới. Nhấn lưu khi hoàn tất."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Tên bài học</Label>
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
            <div className="grid gap-2">
              <Label htmlFor="content">Nội dung / Mô tả</Label>
              <Textarea
                id="content"
                placeholder="Nhập nội dung hoặc mô tả bài học..."
                className="min-h-[100px]"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu bài học"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
