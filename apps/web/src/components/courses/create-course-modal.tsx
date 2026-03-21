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

interface CreateCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    id: string;
    title: string;
    description: string;
    level: string;
  } | null;
}

export function CreateCourseModal({ open, onOpenChange, initialData }: CreateCourseModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    level: initialData?.level || "A1",
  });

  // Update form data when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
        level: initialData.level || "A1",
      });
    } else {
      setFormData({ title: "", description: "", level: "A1" });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isEditing = !!initialData;
      const url = isEditing 
        ? `http://localhost:3001/api/v1/courses/${initialData.id}`
        : "http://localhost:3001/api/v1/courses";
        
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(isEditing ? "Failed to update course" : "Failed to create course");
      }

      toast.success(isEditing ? "Cập nhật khóa học thành công!" : "Khóa học đã được tạo thành công!");
      onOpenChange(false);
      setFormData({ title: "", description: "", level: "A1" });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tạo khóa học.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}</DialogTitle>
            <DialogDescription>
              {initialData 
                ? "Chỉnh sửa thông tin chi tiết của khóa học. Nhấn lưu khi hoàn tất."
                : "Nhập thông tin chi tiết cho khóa học mới của bạn. Nhấn lưu khi hoàn tất."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Tên khóa học</Label>
              <Input
                id="title"
                placeholder="Nhập tên khóa học..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="level">Cấp độ (Level)</Label>
              <select
                id="level"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              >
                <option value="A1">A1 - Sơ cấp</option>
                <option value="A2">A2 - Sơ cấp</option>
                <option value="B1">B1 - Trung cấp</option>
                <option value="B2">B2 - Trung cấp</option>
                <option value="C1">C1 - Cao cấp</option>
                <option value="C2">C2 - Cao cấp</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả khóa học..."
                className="min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu khóa học"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
