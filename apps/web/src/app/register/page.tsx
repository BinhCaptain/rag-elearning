"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Asterisk, AtSign, BrainCircuit, Loader2, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Đăng ký thất bại");
      }

      const data = await res.json();

      Cookies.set("token", data.accessToken, { expires: 7 });
      Cookies.set("user_id", data.user.id, { expires: 7 });
      Cookies.set("user_name", data.user.name || data.user.email, { expires: 7 });
      Cookies.set("user_email", data.user.email, { expires: 7 });
      Cookies.set("user_role", data.user.role, { expires: 7 });

      toast.success(`Chào mừng, ${data.user.name}! Tài khoản đã được tạo thành công.`);
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Visual Left Section */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-primary text-primary-foreground p-10 relative overflow-hidden hero-pattern-dark">
        <div className="absolute inset-0 z-0 bg-primary/20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="z-10 animate-fade-in-up max-w-md text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-lg mb-8 shadow-2xl">
              <BrainCircuit className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Mở khóa tương lai học thuật</h1>
            <p className="text-primary-foreground/80 text-lg leading-relaxed">
              Dữ liệu bài tập và tiến trình học tập của bạn đều được theo dõi và cải thiện nhờ sự phân tích của trí tuệ nhân tạo.
            </p>
        </div>
      </div>

      {/* Register Form Section */}
      <div className="flex items-center justify-center p-6 sm:p-12 animate-fade-in-up">
        <Card className="w-full max-w-md border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm sm:border sm:border-slate-200">
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-2 lg:hidden">
              <BrainCircuit className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Tạo tài khoản mới</CardTitle>
            <CardDescription className="text-slate-500">
              Điền thông tin của bạn để bắt đầu học với AI
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="pl-9"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@school.edu.vn"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Asterisk className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-9"
                    placeholder="Ít nhất 6 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Button className="w-full h-11 text-base" type="submit" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tạo tài khoản...</> : "Hoàn tất đăng ký"}
              </Button>
              <div className="text-center text-sm text-slate-500">
                Đã có tài khoản?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline transition-all">
                  Đăng nhập
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
