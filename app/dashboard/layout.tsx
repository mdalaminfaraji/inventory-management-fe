'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, Bell, Settings } from 'lucide-react';
import { Toaster } from 'sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
    } else {
      setIsReady(true);
    }
  }, [router]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider className="bg-[#050505]">
      <Toaster position="top-right" richColors />
      <AppSidebar />
      <SidebarInset className="bg-[#050505] min-h-screen transition-all duration-300">
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 px-6 flex items-center justify-between sticky top-0 bg-[#050505]/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-white !hover:bg-white/10 cursor-pointer" />
            <h2 className="text-xl font-semibold capitalize text-white">
              {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-white/5 rounded-full px-4 py-2 border border-white/10 text-gray-400 text-sm w-64">
              Search anything...
            </div>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all relative text-white">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-white">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-8 pb-12 overflow-x-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
