'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Tags, 
  AlertCircle, 
  History, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Settings,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster, toast } from 'sonner';

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  role?: string;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Categories', href: '/dashboard/categories', icon: Tags, role: 'Admin' },
  { name: 'Restock Queue', href: '/dashboard/restock', icon: AlertCircle },
  { name: 'Activity Log', href: '/dashboard/logs', icon: History },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        className="fixed left-0 top-0 h-full bg-[#0a0a0a] border-r border-white/5 z-40 sidebar-blur flex flex-col"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white border border-white/10 hover:scale-110 transition-transform shadow-lg z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo Section */}
        <div className="p-6 mb-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Package className="text-white" size={24} />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
                >
                  StockBondhu
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-2 py-2 overflow-y-auto no-scrollbar">
          {sidebarItems.map((item) => {
            if (item.role && user.role !== item.role) return null;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group",
                    isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "hover:bg-white/5 text-gray-400 hover:text-white"
                  )}
                >
                  <item.icon className={cn("shrink-0", isActive ? "text-white" : "group-hover:text-primary transition-colors")} size={22} />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-medium whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && !isCollapsed && (
                    <motion.div
                      layoutId="active-nav"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-lg shadow-white/50"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User & Footer Section */}
        <div className="p-4 border-t border-white/5 space-y-4">
          <div className={cn("flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5", isCollapsed ? "justify-center" : "")}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center shrink-0">
               <UserIcon size={18} className="text-gray-300" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-sm font-semibold truncate">{user.name}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{user.role}</span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main 
        className={cn(
          "flex-1 min-h-screen transition-all duration-300",
          isCollapsed ? "pl-[80px]" : "pl-[280px]"
        )}
      >
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between sticky top-0 bg-[#050505]/80 backdrop-blur-md z-30">
          <h2 className="text-xl font-semibold capitalize">
            {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-white/5 rounded-full px-4 py-2 border border-white/10 text-gray-400 text-sm w-64">
              Search anything...
            </div>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-8 pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}
