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

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
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
