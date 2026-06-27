"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Trash2, RefreshCw, ShieldCheck, GraduationCap, Loader2, Plus, Pencil, Eye, BookOpen, Award } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STUDENT";
  avatar?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "STUDENT" });

  const [progressUser, setProgressUser] = useState<User | null>(null);
  const [progressData, setProgressData] = useState<{ courses: any[]; quizzes: any[] } | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [progressTab, setProgressTab] = useState<'courses' | 'quizzes'>('courses');

  const token = Cookies.get("token");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/v1/users", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Không thể tải danh sách users");
      const data = await res.json();
      setUsers(data);
    } catch (e: any) {
      toast.error(e.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`http://localhost:3001/api/v1/users/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok && res.status !== 204) throw new Error("Xóa thất bại");
      toast.success(`Đã xóa user "${deleteTarget.name}"`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    } catch (e: any) {
      toast.error(e.message || "Có lỗi xảy ra");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "STUDENT" });
    setFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: "", role: user.role });
    setFormOpen(true);
  };

  const handleOpenProgress = async (user: User) => {
    setProgressUser(user);
    setLoadingProgress(true);
    setProgressTab('courses');
    setProgressData(null);
    try {
      const res = await fetch(`http://localhost:3001/api/v1/users/${user.id}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Không thể tải thông tin tiến độ học tập");
      const data = await res.json();
      setProgressData(data);
    } catch (e: any) {
      toast.error(e.message || "Có lỗi xảy ra");
      setProgressUser(null);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    
    try {
      const isEdit = !!editingUser;
      const url = isEdit 
        ? `http://localhost:3001/api/v1/users/${editingUser.id}` 
        : "http://localhost:3001/api/v1/users";
        
      const payload = isEdit 
        ? { name: formData.name, role: formData.role } 
        : { name: formData.name, email: formData.email, password: formData.password, role: formData.role };

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Lưu thất bại");
      
      toast.success(isEdit ? "Đã cập nhật thông tin thành công" : "Tạo tài khoản thành công");
      setFormOpen(false);
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || "Có lỗi xảy ra");
    } finally {
      setFormSaving(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const studentCount = users.filter((u) => u.role === "STUDENT").length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Quản lý Người dùng
          </h1>
          <p className="text-slate-500 mt-1">Xem và quản lý tất cả tài khoản trong hệ thống.</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Button onClick={handleOpenAdd} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm tài khoản
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tổng users", value: users.length, color: "bg-primary/10 text-primary" },
          { label: "Quản trị viên", value: adminCount, color: "bg-amber-500/10 text-amber-600" },
          { label: "Học viên", value: studentCount, color: "bg-emerald-500/10 text-emerald-600" },
        ].map((s) => (
          <Card key={s.label} className="border-slate-200 shadow-sm">
            <CardContent className="pt-6 pb-4">
              <div className={`text-3xl font-bold ${s.color.split(" ")[1]}`}>{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm theo tên hoặc email..."
                className="pl-9 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Users className="h-12 w-12 mb-3 opacity-30" />
              <p className="font-medium">Không tìm thấy user nào</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {/* Header row */}
              <div className="grid grid-cols-[1fr_1.5fr_auto_auto] gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/80">
                <span>Người dùng</span>
                <span>Email</span>
                <span>Vai trò</span>
                <span>Hành động</span>
              </div>
              {filtered.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-[1fr_1.5fr_auto_auto] gap-4 px-6 py-4 items-center hover:bg-slate-50/60 transition-colors"
                >
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 shrink-0 ring-2 ring-slate-100">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <p className="text-sm text-slate-600 truncate">{user.email}</p>

                  {/* Role badge */}
                  <div>
                    {user.role === "ADMIN" ? (
                      <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 gap-1 hover:bg-amber-500/15">
                        <ShieldCheck className="h-3 w-3" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 gap-1 hover:bg-emerald-500/15">
                        <GraduationCap className="h-3 w-3" />
                        Học viên
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {user.role === "STUDENT" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        onClick={() => handleOpenProgress(user)}
                        title="Xem tiến độ học tập"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10"
                      onClick={() => handleOpenEdit(user)}
                      title="Sửa user"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => setDeleteTarget(user)}
                      disabled={user.role === "ADMIN"}
                      title={user.role === "ADMIN" ? "Không thể xóa admin" : "Xóa user"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản{" "}
              <span className="font-semibold text-slate-900">"{deleteTarget?.name}"</span>?{" "}
              Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Xóa tài khoản
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create/Edit User Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Cập nhật người dùng" : "Thêm mới người dùng"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Thay đổi thông tin người dùng được chọn." : "Tạo một tài khoản mới và cấp quyền đăng nhập."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveUser} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
                disabled={!!editingUser}
                className={editingUser ? "bg-slate-50 text-slate-500" : ""}
              />
            </div>

            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  required 
                  minLength={6}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select 
                value={formData.role} 
                onValueChange={(v) => setFormData({...formData, role: v as any})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn quyền" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Học viên</SelectItem>
                  <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={formSaving}>
                {formSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingUser ? "Cập nhật" : "Tạo tài khoản"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Student Progress Dialog */}
      <Dialog open={!!progressUser} onOpenChange={(open) => !open && setProgressUser(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <GraduationCap className="h-6 w-6 text-primary" />
              Tiến độ học tập: {progressUser?.name}
            </DialogTitle>
            <DialogDescription>
              Xem các khóa học đã đăng ký và kết quả làm bài trắc nghiệm của học viên.
            </DialogDescription>
          </DialogHeader>

          {loadingProgress ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
          ) : !progressData ? (
            <div className="text-center py-10 text-slate-500">
              Không thể tải dữ liệu tiến độ.
            </div>
          ) : (
            <div className="space-y-6 pt-4">
              {/* Tab selector */}
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setProgressTab('courses')}
                  className={`flex-1 py-2.5 text-sm font-semibold border-b-2 text-center transition-colors ${
                    progressTab === 'courses'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Khóa học đã đăng ký ({(progressData as any).courses.length})
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setProgressTab('quizzes')}
                  className={`flex-1 py-2.5 text-sm font-semibold border-b-2 text-center transition-colors ${
                    progressTab === 'quizzes'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Award className="h-4 w-4" />
                    Kết quả trắc nghiệm ({(progressData as any).quizzes.length})
                  </div>
                </button>
              </div>

              {/* Tab contents */}
              {progressTab === 'courses' ? (
                <div className="space-y-4">
                  {(progressData as any).courses.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 border border-slate-100 rounded-2xl">
                      <BookOpen className="h-10 w-10 mx-auto opacity-30 mb-2" />
                      Học viên chưa đăng ký khóa học nào.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {(progressData as any).courses.map((course: any) => (
                        <div key={course.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-slate-900">{course.title}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Cấp độ: <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-bold uppercase">{course.level || 'N/A'}</Badge>
                              </p>
                            </div>
                            <span className="text-sm font-bold text-primary">{course.progressPercentage}%</span>
                          </div>
                          
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${course.progressPercentage}%` }}
                            />
                          </div>
                          
                          <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                            <span>Đã học {course.completedLessons}/{course.totalLessons} bài học</span>
                            <span>Đăng ký: {new Date(course.enrolledAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {(progressData as any).quizzes.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 border border-slate-100 rounded-2xl">
                      <Award className="h-10 w-10 mx-auto opacity-30 mb-2" />
                      Chưa làm bài trắc nghiệm nào.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                      {(progressData as any).quizzes.map((attempt: any) => {
                        const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
                        const passed = pct >= 80;
                        return (
                          <div key={attempt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                {attempt.courseTitle}
                              </span>
                              <h5 className="font-semibold text-slate-900 text-sm truncate mt-0.5">
                                {attempt.quizTitle}
                              </h5>
                              <p className="text-xs text-slate-500 truncate mt-0.5">
                                Bài: {attempt.lessonTitle}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                              <div className="text-right">
                                <span className={`text-sm font-extrabold ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {attempt.score}/{attempt.totalQuestions} ({pct}%)
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  {new Date(attempt.createdAt).toLocaleDateString('vi-VN')} {new Date(attempt.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                              <Badge className={`font-bold text-[10px] border-none py-0.5 px-2 rounded-full uppercase ${
                                passed 
                                  ? 'bg-emerald-50 text-emerald-700' 
                                  : 'bg-amber-50 text-amber-700'
                              }`}>
                                {passed ? 'Đạt' : 'Chưa Đạt'}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setProgressUser(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
