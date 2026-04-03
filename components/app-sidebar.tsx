"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  AlertCircle,
  History,
  LogOut,
  Settings,
  User as UserIcon,
  ChevronUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarItem {
  name: string;
  href: string;
  icon: LucideIcon;
  role?: string;
}

const sidebarItems: SidebarItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: Tags,
    role: "Admin",
  },
  { name: "Restock Queue", href: "/dashboard/restock", icon: AlertCircle },
  { name: "Activity Log", href: "/dashboard/logs", icon: History },
];

interface User {
  name: string;
  role: string;
}

export function AppSidebar() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 sidebar-blur">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-blue-600 shadow-lg shadow-primary/20">
            <Package className="text-white" size={24} />
          </div>
          <span className="text-xl font-black tracking-tight text-white group-data-[collapsible=icon]:hidden">
            StockBondhu
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 group-data-[collapsible=icon]:hidden mt-6 mb-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 gap-1.5">
              {sidebarItems.map((item) => {
                if (item.role && user.role !== item.role) return null;
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3 h-12 rounded-xl transition-all duration-300 group",
                        isActive
                          ? "bg-primary !text-white shadow-lg shadow-primary/20 hover:bg-primary hover:text-white"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon
                          className={cn(
                            "size-5 shrink-0 transition-colors",
                            isActive ? "text-white" : "group-hover:text-primary"
                          )}
                        />
                        <span className="font-medium group-data-[collapsible=icon]:hidden">
                          {item.name}
                        </span>
                      </Link>
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
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-14 w-full justify-start gap-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-gray-700 to-gray-900 border border-white/10">
                    <UserIcon size={18} className="text-gray-300" />
                  </div>
                  <div className="flex flex-col items-start min-w-0 group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-semibold truncate text-white">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                      {user.role}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4 text-gray-500 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-(--radix-dropdown-menu-trigger-width) bg-[#0a0a0a] border-white/10 text-white"
              >
                <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer">
                   <Settings className="mr-2 size-4" />
                   <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                >
                   <LogOut className="mr-2 size-4" />
                   <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
