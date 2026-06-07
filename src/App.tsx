import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Products from "./pages/Products";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Home from "./pages/Home"
import PaymentSuccess from "./pages/PaymentSuccess"
import Training from "./pages/Training";

//admin
import Dashboard from "./admin/pages/Dashboard";
import Oorders from "./admin/pages/Orders";
import AdminProducts from "./admin/pages/Products";
import Inventory from "./admin/pages/Inventory";
import Customers from "./admin/pages/Customers";
import Payments from "./admin/pages/Payments";
import Analytics from "./admin/pages/Analytics";
import Users from "./admin/pages/Users";
import Settings from "./admin/pages/Settings";
import ActivityLog from "./admin/pages/ActivityLog";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products/:category?" element={<Products />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/training" element={<Training />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/orders" element={<Oorders />} />
        <Route path="/admin/inventory" element={<Inventory />} />
        <Route path="/admin/customers" element={<Customers />} />
        <Route path="/admin/payments" element={<Payments />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/activity" element={<ActivityLog />} />
        <Route path="/admin" element={<AdminProducts />} />

        <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AnimatedRoutes />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
