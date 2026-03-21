"use client";

import Link from "next/link";
import { BookOpen, BrainCircuit, LineChart, LogOut, Settings, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { UserProfile } from "@/lib/auth";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const studentMenuItems = [
  { title: "Tổng quan", url: "/dashboard", icon: LineChart },
  { title: "Khóa học", url: "/courses", icon: BookOpen },
  { title: "AI Trợ giảng", url: "/chat", icon: BrainCircuit },
];

const adminMenuItems = [
  { title: "Tổng quan Admin", url: "/dashboard", icon: LineChart },
  { title: "Quản lý Khóa học", url: "/courses", icon: BookOpen },
  { title: "Quản lý AI Chatbot", url: "/chat", icon: BrainCircuit },
];

export function AppSidebar({ user }: { user: UserProfile }) {
  const pathname = usePathname();
  const { state } = useSidebar();
  
  const menuItems = user.role === "ADMIN" ? adminMenuItems : studentMenuItems;

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200">
      <SidebarHeader className="border-b border-slate-200 py-4 h-16 flex justify-center">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2 px-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BrainCircuit className="h-5 w-5" />
            </div>
            {state === "expanded" && (
              <span className="font-bold text-lg text-slate-900 tracking-tight">AI E-learning</span>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase text-slate-500 font-semibold tracking-wider">
            {user.role === "ADMIN" ? "Quản trị viên" : "Học tập"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      render={<Link href={item.url} />}
                      isActive={isActive} 
                      tooltip={item.title}
                      className={`transition-colors h-10 ${isActive ? "bg-primary/10 text-primary font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-slate-500"}`} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.role === "ADMIN" ? "AD" : "HS"}</AvatarFallback>
              </Avatar>
              {state === "expanded" && (
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-sm font-medium text-slate-900 truncate">{user.name}</span>
                  <span className="text-xs text-slate-500 truncate">{user.email}</span>
                </div>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
