"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Search, Edit, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CreateCourseModal } from "@/components/courses/create-course-modal";

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  isPublished: boolean;
  _count: {
    lessons: number;
  };
}

interface AdminCoursesPageProps {
  initialCourses: Course[];
}

export default function AdminCoursesPage({ initialCourses }: AdminCoursesPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");

  const handleEditClick = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const router = useRouter();

  const handleDelete = async (courseId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa khóa học này không? Hành động này không thể hoàn tác.")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/v1/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete course");
      }

      toast.success("Đã xóa khóa học thành công!");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi xóa khóa học.");
    }
  };
  
  const filteredCourses = initialCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "published" && course.isPublished) || 
      (filterStatus === "draft" && !course.isPublished);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-none">Quản lý Khóa học</h1>
          <p className="text-slate-500 mt-2">Thêm mới, chỉnh sửa và cấu hình các khóa học trong hệ thống.</p>
        </div>
        <Button className="shrink-0 gap-2" onClick={handleCreateClick}>
          <Plus className="h-4 w-4" />
          Tạo khóa học mới
        </Button>
      </div>

      <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden flex-col flex-1">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Tìm kiếm khóa học..." 
              className="pl-9 bg-white" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã công khai</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[400px]">Tên khóa học</TableHead>
                <TableHead>Cấp độ</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Số Bài học</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium text-slate-900">
                    <Link href={`/courses/${course.id}`} className="hover:text-primary transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        {course.title}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-600">{course.description ? "Mỹ thuật" : "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50">{course.level || "N/A"}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">{course._count.lessons} bài</TableCell>
                  <TableCell>
                    {course.isPublished ? (
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Đã Publish</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent">Bản nháp</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-500 hover:text-blue-600"
                      onClick={() => handleEditClick(course)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-500 hover:text-red-600"
                      onClick={() => handleDelete(course.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {initialCourses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                    Chưa có khóa học nào. Nhấn "Tạo khóa học mới" để bắt đầu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CreateCourseModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        initialData={selectedCourse} 
      />
    </div>
  );
}
