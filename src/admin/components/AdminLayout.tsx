import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Clock, 
  Package, 
  Warehouse, 
  Users, 
  FileText, 
  CreditCard, 
  Heart, 
  BarChart3, 
  UserCog, 
  Settings as SettingsIcon,
  Menu,
  X,
  Search,
  Bell,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
  { icon: Clock, label: "Preorders", path: "/admin/preorders" },
  { icon: Package, label: "Products", path: "/admin/products" },
  { icon: Warehouse, label: "Inventory", path: "/admin/inventory" },
  { icon: Users, label: "Customers", path: "/admin/customers" },
  { icon: FileText, label: "Quotes", path: "/admin/quotes" },
  { icon: CreditCard, label: "Payments", path: "/admin/payments" },
  { icon: Heart, label: "CSR Reports", path: "/admin/csr" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: UserCog, label: "Users", path: "/admin/users" },
  { icon: SettingsIcon, label: "Settings", path: "/admin/settings" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-card border-r transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && (
            <h2 className="text-xl font-heading font-bold text-foreground">
              JuiceAdmin
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders, products, customers..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    GA
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">Gideon Admin</p>
                  <p className="text-muted-foreground text-xs">Administrator</p>
                </div>
              </div>

              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
