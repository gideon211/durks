import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { refreshToken as apiRefreshToken } from "@/api/authApi";

interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  role: "admin" | "user";
  token: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  tryRefreshToken: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const addToCart = useCartStore((s) => s.addToCart);

  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    
  };

  const tryRefreshToken = async (): Promise<User | null> => {
    try {
      if (!user?.refreshToken) return null;
      const res = await apiRefreshToken(user.refreshToken);
      const updated: User = { ...user, token: res.token };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    } catch {
      logout();
      return null;
    }
  };

  const processPendingAdd = async (currentUser: User | null) => {
    const raw = localStorage.getItem("pendingAdd");
    if (!raw) return false;
    const pending = JSON.parse(raw);
    if (!pending?.product || !pending?.quantity) {
      localStorage.removeItem("pendingAdd");
      return false;
    }

    let activeUser = currentUser;
    if (!activeUser) {
      const refreshed = await tryRefreshToken();
      if (!refreshed) {
        localStorage.removeItem("pendingAdd");
        navigate("/auth");
        return false;
      }
      activeUser = refreshed;
    }

    addToCart(pending.product, pending.quantity);
    localStorage.removeItem("pendingAdd");
    navigate(pending.from || "/cart");
    return true;
  };

  useEffect(() => {
    (async () => {
      if (!user) {
        const refreshed = await tryRefreshToken();
        if (refreshed) await processPendingAdd(refreshed);
      } else {
        await processPendingAdd(user);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => await processPendingAdd(user))();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, tryRefreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
