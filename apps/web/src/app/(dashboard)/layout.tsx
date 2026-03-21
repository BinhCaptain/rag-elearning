import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <AppSidebar user={user} />
        
        <main className="flex-1 flex flex-col w-full min-w-0">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 w-full shadow-sm/50">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2 text-slate-600 hover:text-slate-900 focus:bg-slate-100" />
              <Separator orientation="vertical" className="h-6 w-px bg-slate-200" />
              
              <Breadcrumb>
                <BreadcrumbList className="text-sm">
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard" className="text-slate-500 hover:text-slate-900">Học tập</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-slate-400" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium text-slate-900">Tổng quan</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          {/* Main content wrapper */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="mx-auto max-w-6xl w-full h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
