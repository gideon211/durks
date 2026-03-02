import { createRoot } from "react-dom/client";
import { inject } from "@vercel/analytics";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from './context/Authcontext';
import { CartProvider } from "@/context/CartContext";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import ScrollToTop from "@/components/ScrollToTop";
// Initialize Vercel Web Analytics
inject();
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
       <ScrollToTop />
        
        <CartProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
            </CartProvider>
    </BrowserRouter>

);
