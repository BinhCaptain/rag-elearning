"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, PlayCircle, Plus, Edit, Trash, ArrowLeft, ListChecks, Users, UserX, Loader2 } from "lucide-react";
import Link from "next/link";
import { CreateLessonModal } from "@/components/courses/create-lesson-modal";
import { CreateCourseModal } from "@/components/courses/create-course-modal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronUp, ChevronDown, Settings, Trash2 } from "lucide-react";
import Cookies from "js-cookie";

interface Lesson {
  id: string;
  title: string;
  order: number;
  content?: string;
  videoUrl?: string;
  quizzes?: { id: string }[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  isPublished: boolean;
  lessons: Lesson[];
}

interface EnrolledUser {
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: string;
  };
}

interface AdminCourseDetailPageProps {
  course: Course;
}

function EnrolledUsersTab({ courseId }: { courseId: string }) {
  const [enrollments, setEnrollments] = useState<EnrolledUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unenrollingId, setUnenrollingId] = useState<string | null>(null);
  const token = Cookies.get("token");

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/v1/enrollments/admin/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Không thể tải danh sách học viên");
      const data = await res.json();
      setEnrollments(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [courseId, token]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleUnenroll = async (userId: string, userName: string) => {
    if (!confirm(`Hủy đăng ký của "${userName}" khỏi khóa học này?`)) return;
    setUnenrollingId(userId);
    try {
      const res = await fetch(`http://localhost:3001/api/v1/enrollments/admin/${userId}/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok && res.status !== 204) throw new Error("Hủy đăng ký thất bại");
      toast.success(`Đã hủy đăng ký của "${userName}"`);
      setEnrollments((prev) => prev.filter((e) => e.user.id !== userId));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUnenrollingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
        <Users className="h-12 w-12 mb-3 opacity-30" />
        <p className="font-medium text-slate-500">Chưa có học viên đăng ký</p>
        <p className="text-sm mt-1">Khi có người đăng ký, họ sẽ xuất hiện tại đây.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-700">
          <span className="text-primary font-bold">{enrollments.length}</span> học viên đã đăng ký
        </h3>
        <Button variant="ghost" size="sm" onClick={fetchEnrollments} className="text-slate-500 gap-1.5 text-xs">
          Làm mới
        </Button>
      </div>
      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="grid grid-cols-[1fr_1.5fr_auto_auto] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50">
          <span>Học viên</span>
          <span>Email</span>
          <span>Ngày đăng ký</span>
          <span>Hành động</span>
        </div>
        {enrollments.map((enrollment) => (
          <div
            key={enrollment.user.id}
            className="grid grid-cols-[1fr_1.5fr_auto_auto] gap-4 px-5 py-3.5 items-center hover:bg-slate-50/60 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={enrollment.user.avatar} alt={enrollment.user.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                  {enrollment.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium text-slate-900 truncate text-sm">{enrollment.user.name}</p>
            </div>
            <p className="text-sm text-slate-500 truncate">{enrollment.user.email}</p>
            <p className="text-xs text-slate-400 whitespace-nowrap">
              {new Date(enrollment.createdAt).toLocaleDateString("vi-VN")}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
              onClick={() => handleUnenroll(enrollment.user.id, enrollment.user.name)}
              disabled={unenrollingId === enrollment.user.id}
            >
              {unenrollingId === enrollment.user.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserX className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminCourseDetailPage({ course }: AdminCourseDetailPageProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>(
    [...course.lessons].sort((a, b) => a.order - b.order)
  );
  const [loading, setLoading] = useState(false);

  const handleEditClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedLesson(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài học này không?")) return;

    const previousLessons = [...lessons];
    setLessons(lessons.filter(l => l.id !== lessonId));

    try {
      const res = await fetch(`http://localhost:3001/api/v1/lessons/${lessonId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete lesson");
      
      toast.success("Đã xóa bài học!");
    } catch (error) {
      console.error(error);
      setLessons(previousLessons);
      toast.error("Lỗi khi xóa bài học.");
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newLessons = [...lessons];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newLessons.length) return;

    const temp = newLessons[index];
    newLessons[index] = newLessons[targetIndex];
    newLessons[targetIndex] = temp;

    const updatedLessons = newLessons.map((l, i) => ({ ...l, order: i + 1 }));
    setLessons(updatedLessons);

    try {
      await Promise.all([
        fetch(`http://localhost:3001/api/v1/lessons/${updatedLessons[index].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: updatedLessons[index].order }),
        }),
        fetch(`http://localhost:3001/api/v1/lessons/${updatedLessons[targetIndex].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: updatedLessons[targetIndex].order }),
        })
      ]);
      toast.success("Đã cập nhật thứ tự!");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật thứ tự.");
      setLessons(lessons);
    }
  };
  
  const handleTogglePublish = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/v1/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });

      if (!res.ok) throw new Error("Failed to update course");
      
      toast.success(course.isPublished ? "Đã hủy công khai khóa học" : "Đã công khai khóa học!");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật trạng thái khóa học.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/v1/courses/${course.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete course");

      toast.success("Đã xóa khóa học thành công");
      router.push("/courses");
      router.refresh();
    } catch (error) {
      toast.error("Không thể xóa khóa học");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 p-6 md:p-10 gap-8 animate-fade-in">
      <CreateCourseModal 
        open={isEditCourseOpen} 
        onOpenChange={setIsEditCourseOpen} 
        initialData={{
          id: course.id,
          title: course.title,
          description: course.description,
          level: course.level
        }}
      />
      {/* Back button */}
      <Link href="/courses" className="flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors group w-fit">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Quay lại Quản lý Khóa học
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
              Level {course.level}
            </div>
            {course.isPublished ? (
              <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 uppercase tracking-wider">
                Đã công khai
              </div>
            ) : (
              <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Bản nháp
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-none">{course.title}</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">{course.description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Button variant="outline" className="gap-2" onClick={() => setIsEditCourseOpen(true)}>
            <Settings className="h-4 w-4" />
            Sửa khóa học
          </Button>
          <Button variant="outline" className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/5" onClick={handleDeleteCourse}>
            <Trash2 className="h-4 w-4" />
            Xóa khóa học
          </Button>
          <Button 
            variant="outline" 
            className={`${course.isPublished ? "text-slate-600" : "text-green-600 border-green-200 hover:bg-green-50"} gap-2`}
            onClick={handleTogglePublish}
            disabled={loading}
          >
            {course.isPublished ? "Hủy công khai" : "Công khai khóa học"}
          </Button>
          <Button className="gap-2" onClick={handleCreateClick}>
            <Plus className="h-4 w-4" />
            Thêm bài học mới
          </Button>
        </div>
      </div>

      <Separator className="bg-slate-200" />

      {/* Tabs */}
      <Tabs defaultValue="lessons" className="flex-1">
        <TabsList className="mb-6 bg-slate-100 p-1 rounded-xl h-auto">
          <TabsTrigger
            value="lessons"
            className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary rounded-lg px-4 py-2"
          >
            <BookOpen className="h-4 w-4" />
            Nội dung bài học ({lessons.length})
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary rounded-lg px-4 py-2"
          >
            <Users className="h-4 w-4" />
            Học viên đăng ký
          </TabsTrigger>
        </TabsList>

        {/* Lessons Tab */}
        <TabsContent value="lessons">
          <div className="grid gap-3">
            {lessons.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl">
                Chưa có bài học nào. Bấm "Thêm bài học mới" để bắt đầu.
              </div>
            ) : (
              lessons.map((lesson, index) => (
                <div key={lesson.id} className="group flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-primary/40 transition-all duration-300 shadow-sm">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        disabled={index === lessons.length - 1}
                        onClick={() => handleMove(index, 'down')}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      {lesson.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        {lesson.quizzes && lesson.quizzes.length > 0 ? (
                          <><ListChecks className="h-3 w-3 text-amber-500" /> Bài tập trắc nghiệm</>
                        ) : lesson.videoUrl ? (
                          <><PlayCircle className="h-3 w-3 text-blue-500" /> Video bài giảng</>
                        ) : (
                          <><BookOpen className="h-3 w-3 text-slate-400" /> Nội dung bài đọc</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600" onClick={() => handleEditClick(lesson)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Sửa
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-600" onClick={() => handleDelete(lesson.id)}>
                      <Trash className="h-4 w-4 mr-2" />
                      Xóa
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students">
          <EnrolledUsersTab courseId={course.id} />
        </TabsContent>
      </Tabs>

      <CreateLessonModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        courseId={course.id} 
        initialData={selectedLesson} 
      />
    </div>
  );
}
