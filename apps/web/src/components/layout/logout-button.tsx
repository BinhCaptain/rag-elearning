"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all auth cookies
    Cookies.remove("token");
    Cookies.remove("user_id");
    Cookies.remove("user_name");
    Cookies.remove("user_email");
    Cookies.remove("user_role");
    Cookies.remove("role"); // legacy cookie
    
    toast.success("Đã đăng xuất thành công");
    router.push("/login");
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="w-full justify-start gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
    >
      <LogOut className="h-4 w-4" />
      Đăng xuất
    </Button>
  );
}
