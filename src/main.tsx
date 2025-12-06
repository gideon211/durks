import { createRoot } from "react-dom/client";
import { inject } from "@vercel/analytics";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from './context/Authcontext';
import { CartProvider } from "@/context/CartContext";
import { BrowserRouter } from "react-router-dom";

// Initialize Vercel Web Analytics
inject();

createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        
        <CartProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
            </CartProvider>
    </BrowserRouter>

);
