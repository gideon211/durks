import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Products from "./pages/Products";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import CSR from "./pages/CSR";
import Cart from "./pages/Cart";
import BulkQuote from "./pages/BulkQuote";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Home from "./pages/Home"
import PaymentSuccess from "./pages/PaymentSuccess"

//admin

import Dashboard from "./admin/pages/Dashboard";
import Oorders from "./admin/pages/Orders";
import Preorders from "./admin/pages/Preorders";
import AdminProducts from "./admin/pages/Products";
import Inventory from "./admin/pages/Inventory";
import Customers from "./admin/pages/Customers";
import Quotes from "./admin/pages/Quotes";
import Payments from "./admin/pages/Payments";
import CSRReports from "./admin/pages/CSRReports";
import Analytics from "./admin/pages/Analytics";
import Users from "./admin/pages/Users";
import Settings from "./admin/pages/Settings";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/" element={<Products />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:category" element={<Products />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/csr" element={<CSR />} />
            <Route path="/csr/cup-foundation" element={<CSR />} />
            <Route path="/csr/project-unforgotten" element={<CSR />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/bulk-quote" element={<BulkQuote />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="*" element={<NotFound />} />
            <Route path="orders" element={<Orders />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />



                    
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/orders" element={<Oorders />} />
            <Route path="/admin/preorders" element={<Preorders />} />
            <Route path="/admin" element={<AdminProducts />} />
            {/* <Route path="/admin/products" element={<AdminProducts />} /> */}
            <Route path="/admin/inventory" element={<Inventory />} />
            <Route path="/admin/customers" element={<Customers />} />
            <Route path="/admin/quotes" element={<Quotes />} />
            <Route path="/admin/payments" element={<Payments />} />
            <Route path="/admin/csr" element={<CSRReports />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Routes>
    </AnimatePresence>
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
