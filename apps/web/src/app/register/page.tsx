import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Asterisk, AtSign, BrainCircuit, User } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
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
            <CardTitle className="text-2xl font-bold tracking-tight">Tạo tài khoản mới</CardTitle>
            <CardDescription className="text-slate-500">
              Điền thông tin của bạn để bắt đầu học với AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input id="name" type="text" placeholder="Nguyễn Văn A" className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input id="email" type="email" placeholder="student@school.edu.vn" className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Asterisk className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input id="password" type="password" className="pl-9" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button className="w-full h-11 text-base">
              Hoàn tất đăng ký
            </Button>
            <div className="text-center text-sm text-slate-500">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline transition-all">
                Đăng nhập
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>

    </div>
  );
}
