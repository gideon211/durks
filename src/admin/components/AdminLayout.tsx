import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Bell,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/Authcontext";

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
  const location = useLocation();
  const { user, logout } = useAuth();
  const userInitial = (user?.username ?? "U").charAt(0).toUpperCase();

  const isActive = (path: string) => location.pathname === path;

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">D</span>
          </div>
          <span className="font-heading font-bold text-lg">Management</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </>
  );

  return (
    <div className="admin-theme min-h-screen bg-background flex w-full">
      {/* Desktop sidebar — persistent on lg+ */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:border-r lg:bg-card lg:fixed lg:inset-y-0">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar — overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-card border-r shadow-xl transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area — offset by sidebar width on desktop */}
      <div className="flex flex-1 flex-col lg:pl-60">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 border-b bg-card flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm hidden sm:block">
                <p className="font-medium text-foreground leading-tight">
                  {user?.username ?? "Admin"}
                </p>
                <p className="text-muted-foreground text-xs">Administrator</p>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
