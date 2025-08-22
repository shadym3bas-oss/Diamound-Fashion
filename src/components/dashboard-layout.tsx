'use client';
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import Nav from '@/components/nav';
import { Button } from '@/components/ui/button';
import { Gem, LogOut } from 'lucide-react';
import { RefreshButton } from '@/components/refresh-button';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("auth");
    router.push("/admin/login");
  };

  return (
    <SidebarProvider>
      <Sidebar side="right">
        <SidebarContent>
          <div className="p-5 border-b flex flex-col items-center text-center">
             <div className="bg-primary/10 p-4 rounded-full mb-3">
                <Gem className="h-10 w-10 text-primary"/>
             </div>
            <div className="text-2xl font-extrabold text-primary">Diamond Fashion</div>
            <div className="text-sm text-gray-500">Factory Dashboard</div>
          </div>
          <Nav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b md:justify-end">
          <div className="flex items-center gap-4 md:hidden">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">Diamond Fashion</h1>
          </div>
           <div className="flex items-center gap-2">
            <RefreshButton />
            <Button variant="outline" size="icon" onClick={handleLogout} aria-label="تسجيل الخروج">
              <LogOut className="h-4 w-4" />
            </Button>
           </div>
        </header>
        <main className="p-4 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
