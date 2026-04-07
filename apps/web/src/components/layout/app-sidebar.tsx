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
  { title: "Dữ liệu AI RAG", url: "/ingestion", icon: Settings },
];

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronUp, CreditCard, Sparkles } from "lucide-react";
import { LogoutButton } from "./logout-button";
import { Badge } from "@/components/ui/badge";

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

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton size="lg" className="data-[state=open]:bg-slate-100 transition-colors">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="rounded-lg">{user.role === "ADMIN" ? "AD" : "HS"}</AvatarFallback>
                    </Avatar>
                    {state === "expanded" && (
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user.name}</span>
                        <span className="truncate text-xs text-slate-500">{user.email}</span>
                      </div>
                    )}
                    <ChevronUp className="ml-auto h-4 w-4 text-slate-400" />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent
                side="top"
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border-slate-200"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="rounded-lg">{user.role === "ADMIN" ? "AD" : "HS"}</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-semibold">{user.name}</span>
                          <Badge variant="secondary" className="h-4 text-[10px] px-1 bg-primary/10 text-primary border-none">
                            {user.role}
                          </Badge>
                        </div>
                        <span className="truncate text-xs text-slate-500">{user.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Nâng cấp Pro
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                  <User className="h-4 w-4 text-slate-500" />
                  Hồ sơ cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                  <Settings className="h-4 w-4 text-slate-500" />
                  Cài đặt
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="p-1">
                  <LogoutButton />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
