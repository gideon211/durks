"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  BarChart3,
  UserCog,
  Settings as SettingsIcon,
  History,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/Authcontext";
import NotificationDropdown from "./NotificationDropdown";

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
  { icon: Package, label: "Products", path: "/admin" },
  { icon: Users, label: "Customers", path: "/admin/customers" },
  { icon: CreditCard, label: "Payments", path: "/admin/payments" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: UserCog, label: "Users", path: "/admin/users" },
  { icon: History, label: "Activity Log", path: "/admin/activity" },
  { icon: SettingsIcon, label: "Settings", path: "/admin/settings" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const userInitial = (user?.username ?? "U").charAt(0).toUpperCase();

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname.startsWith(path);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-border/50">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm shadow-blue-500/20">
          <span className="text-sm font-bold text-white">D</span>
        </div>
        <div>
          <span className="font-heading font-bold text-sm tracking-tight">Duks Admin</span>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Management Portal</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden ml-auto h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  active
                    ? "bg-blue-50 text-blue-600 border-l-2 border-blue-500 pl-[10px]"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border-l-2 border-transparent pl-[10px]"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 transition-transform duration-300 ${active ? "text-blue-500" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User info at bottom */}
      <div className="px-4 py-4 border-t border-border/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 ring-2 ring-blue-500/10">
            <AvatarFallback className="bg-blue-50 text-blue-600 text-xs font-semibold">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.username ?? "Admin"}</p>
            <p className="text-[11px] text-muted-foreground truncate">Administrator</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 text-muted-foreground hover:text-red-500 transition-colors">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="admin-theme min-h-screen bg-[#f8fafc] flex w-full">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:bg-white lg:border-r lg:border-border/50 lg:fixed lg:inset-y-0 lg:shadow-[1px_0_8px_-4px_rgba(0,0,0,0.04)]">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r shadow-2xl transition-transform duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-border/40 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden h-9 w-9 rounded-xl"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground font-medium">Welcome back</p>
              <p className="text-sm font-semibold">{user?.username ?? "Admin"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <Button variant="ghost" size="icon" onClick={() => router.push("/products")} className="h-9 w-9 rounded-xl text-muted-foreground hover:text-red-500 transition-colors" aria-label="Exit to store">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
