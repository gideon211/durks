import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { useAuth } from "@/context/Authcontext";



interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
  { icon: Package, label: "Products", path: "/admin/products" },
  { icon: Users, label: "Customers", path: "/admin/customers" },
  { icon: CreditCard, label: "Payments", path: "/admin/payments" },
  { icon: Heart, label: "CSR Reports", path: "/admin/csr" },
  { icon: UserCog, label: "Users", path: "/admin/users" },
  { icon: SettingsIcon, label: "Settings", path: "/admin/settings" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const userInitial = (user?.username ?? "U").charAt(0).toUpperCase();


  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-card border-b px-2 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders, products, customers..."
              className="pl-10 w-72"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm hidden sm:block">
              <p className="font-medium">Duks</p>
              <p className="text-muted-foreground text-xs">Administrator</p>
            </div>
          </div>

          <Button variant="ghost" size="icon"   onClick={() => navigate("/products")}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-card border-r z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-64`}
      >
        <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-bold">MANAGEMENT</h3>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5 " />
          </Button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Page Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
