"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Asterisk, AtSign, BrainCircuit, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      // Hardcoded mock check
      if (email === "admin" && password === "admin") {
        Cookies.set("role", "admin", { expires: 7 });
        toast.success("Đăng nhập thành công với quyền Admin");
        router.push("/dashboard");
      } else {
        Cookies.set("role", "student", { expires: 7 });
        toast.success("Đăng nhập thành công với quyền Học sinh");
        router.push("/dashboard");
      }
    }, 1000);
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
            <h1 className="text-4xl font-bold mb-4">Học tiếng Anh chưa bao giờ thông minh đến thế</h1>
            <p className="text-primary-foreground/80 text-lg leading-relaxed">
              Trải nghiệm E-learning thế hệ mới kết hợp sức mạnh của RAG (Retrieval-Augmented Generation) để cá nhân hóa việc học của riêng bạn.
            </p>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex items-center justify-center p-6 sm:p-12 animate-fade-in-up">
        <Card className="w-full max-w-sm border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm sm:border sm:border-slate-200">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">Đăng nhập tài khoản</CardTitle>
            <CardDescription className="text-slate-500">
              Nhập email và mật khẩu của bạn để vào học
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email / Tên đăng nhập</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="text" 
                    placeholder="admin hoặc student" 
                    className="pl-9" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Link href="#" className="text-sm font-medium text-primary hover:underline" tabIndex={-1}>
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Asterisk className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-9" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Button className="w-full h-11 text-base" type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Đăng nhập vào hệ thống"}
              </Button>
              <div className="text-center text-sm text-slate-500">
                Chưa có tài khoản?{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline transition-all">
                  Đăng ký ngay
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
