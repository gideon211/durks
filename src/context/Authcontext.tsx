// src/context/Authcontext.tsx
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
  const loadCartForUser = useCartStore((s) => s.loadCartForUser);
  const mergeGuestIntoUser = useCartStore((s) => s.mergeGuestIntoUser);
  const switchToGuestCart = useCartStore((s) => s.switchToGuestCart);

  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // When logging in: save user, load user's cart (merge guest cart)
  const login = async (userData: User) => {
    try {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      // Merge guest cart into user cart first (local merge),
      // then attempt to load server cart (which will override or be merged depending on server logic).
      await mergeGuestIntoUser(userData.id);
      await loadCartForUser(userData.id);
    } catch (err) {
      // fallback: still set user
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      try {
        await loadCartForUser(userData.id);
      } catch {}
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // switch in-memory cart to guest cart (don't lose the guest cart)
    try {
      switchToGuestCart();
    } catch {
      // final fallback: clear cart if something goes wrong
      try {
        useCartStore.getState().clearCart();
      } catch {}
    }
    navigate("/");
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

    // pending.product can be full product object; addToCart accepts that
    await addToCart(pending.product, pending.product.pack ?? 12, pending.quantity);
    localStorage.removeItem("pendingAdd");
    navigate(pending.from || "/cart");
    return true;
  };

  useEffect(() => {
    (async () => {
      if (!user) {
        // try refresh; if successful, merge/load cart for refreshed user
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          // ensure cart for refreshed user is loaded
          await loadCartForUser(refreshed.id);
          await processPendingAdd(refreshed);
        } else {
          // ensure guest cart loaded
          try {
            switchToGuestCart();
            await processPendingAdd(null);
          } catch {}
        }
      } else {
        // user exists: ensure cart loaded and process pending add
        await loadCartForUser(user.id);
        await processPendingAdd(user);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // whenever user changes (login), ensure cart merges and pending actions handled
      try {
        await mergeGuestIntoUser(user.id);
        await loadCartForUser(user.id);
        await processPendingAdd(user);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
