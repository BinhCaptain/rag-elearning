"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, KeyRound, Save } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    avatar: "",
    role: "STUDENT"
  });
  
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const token = Cookies.get("token");
  const userId = Cookies.get("user_id");

  useEffect(() => {
    // Tải thông tin user hiện tại
    if (!userId || !token) return;
    
    fetch(`http://localhost:3001/api/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      if (data) {
        setProfileData({
          name: data.name || "",
          email: data.email || "",
          avatar: data.avatar || "",
          role: data.role || "STUDENT"
        });
      }
    })
    .catch(e => console.error(e));
  }, [userId, token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/v1/users/profile", {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: profileData.name,
          avatar: profileData.avatar
        })
      });
      
      if (!res.ok) throw new Error("Cập nhật thông tin thất bại");
      const data = await res.json();
      
      // Update cookies
      Cookies.set("user_name", data.name, { expires: 7 });
      toast.success("Cập nhật thông tin thành công!");
    } catch (e: any) {
      toast.error(e.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu phải từ 6 ký tự trở lên");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/v1/users/profile/password", {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          newPassword: passwordData.newPassword
        })
      });
      
      if (!res.ok) throw new Error("Cập nhật mật khẩu thất bại");
      
      toast.success("Cập nhật mật khẩu thành công!");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (e: any) {
      toast.error(e.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <User className="h-8 w-8 text-primary" />
          Hồ sơ cá nhân
        </h1>
        <p className="text-slate-500 mt-1">Quản lý thông tin tài khoản và bảo mật của bạn.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="general">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>
                Cập nhật họ tên và ảnh đại diện của bạn.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-24 w-24 border-4 border-slate-50">
                      <AvatarImage src={profileData.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                        {profileData.name.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Họ và tên</Label>
                        <Input 
                          id="name" 
                          value={profileData.name} 
                          onChange={e => setProfileData({...profileData, name: e.target.value})}
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          value={profileData.email} 
                          disabled
                          className="bg-slate-50 text-slate-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="avatarUrl">URL Ảnh đại diện (tùy chọn)</Label>
                      <Input 
                        id="avatarUrl" 
                        value={profileData.avatar} 
                        onChange={e => setProfileData({...profileData, avatar: e.target.value})}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button type="submit" disabled={loading} className="gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Lưu thay đổi
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>
                Tạo mật khẩu mới cho tài khoản của bạn để tăng cường bảo mật.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      id="newPassword" 
                      type="password" 
                      className="pl-9"
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="Ít nhất 6 ký tự"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      className="pl-9"
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-start pt-4">
                  <Button type="submit" disabled={loading} className="gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Cập nhật mật khẩu
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
