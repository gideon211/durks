import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from './context/Authcontext';
import { CartProvider } from "@/context/CartContext";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        
        <CartProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
            </CartProvider>
    </BrowserRouter>

);
