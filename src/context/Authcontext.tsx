// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";

interface User {
  id: string;
  fullName: string;
  email: string;
  token?: string; // access token (optional)
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
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

  const [isRefreshing, setIsRefreshing] = useState(false);

  const login = (userData: User) => {
    setUser(userData);
    try {
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.warn("Could not persist user to localStorage", err);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("user");
    } catch (err) {
      console.warn("Could not remove user from localStorage", err);
    }
    // Optionally navigate to public route:
    navigate("/");
  };

  /**
   * tryRefreshToken
   * Calls backend /auth/refresh to attempt to get a new access token and user profile.
   * Assumes refresh token is stored as an httpOnly cookie so we use `credentials: 'include'`.
   * Returns the refreshed User or null on failure.
   */
  const tryRefreshToken = async (): Promise<User | null> => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      // Expected server shape: { user: { id, fullName, email }, token: 'newAccessToken' }
      const refreshed: User = {
        id: data.user.id,
        fullName: data.user.fullName,
        email: data.user.email,
        token: data.token,
      };

      setUser(refreshed);
      try {
        localStorage.setItem("user", JSON.stringify(refreshed));
      } catch (err) {
        console.warn("Could not persist refreshed user to localStorage", err);
      }
      return refreshed;
    } catch (err) {
      console.warn("Error refreshing token:", err);
      return null;
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * processPendingAdd
   * - Ensures token is valid (tries refresh if necessary)
   * - Reads pendingAdd from localStorage and applies addToCart
   * - Navigates to pending.from or /cart after adding
   */
  const processPendingAdd = async (currentUser: User | null) => {
    try {
      const raw = localStorage.getItem("pendingAdd");
      if (!raw) return false;

      const pending = JSON.parse(raw) as {
        product: any;
        quantity: number;
        from?: string;
      };
      if (!pending?.product || !pending?.quantity) {
        localStorage.removeItem("pendingAdd");
        return false;
      }

      // If no current user, try to refresh and get one
      let activeUser = currentUser;
      if (!activeUser) {
        const refreshed = await tryRefreshToken();
        if (!refreshed) {
          // unable to refresh -> require login
          localStorage.removeItem("pendingAdd");
          navigate("/auth");
          return false;
        }
        activeUser = refreshed;
      }

      // If we have a user but no token, attempt refresh (best-effort)
      if (activeUser && !activeUser.token) {
        const refreshed = await tryRefreshToken();
        if (!refreshed) {
          // failed to refresh; require login
          localStorage.removeItem("pendingAdd");
          navigate("/auth");
          return false;
        }
        activeUser = refreshed;
      }

      // At this point we have an authenticated user with (likely) a fresh token.
      // Call cart store to add item. Adjust signature if your store differs.
      try {
        addToCart(pending.product, pending.quantity);
      } catch (err) {
        console.warn("addToCart failed while processing pendingAdd:", err);
        // still remove pending to avoid loops
      }

      localStorage.removeItem("pendingAdd");

      // Navigate back to origin or to cart
      if (pending.from) navigate(pending.from);
      else navigate("/cart");

      return true;
    } catch (err) {
      console.warn("Error processing pendingAdd:", err);
      try {
        localStorage.removeItem("pendingAdd");
      } catch {}
      return false;
    }
  };

  // On mount: if no user, try refresh (useful if refresh cookie exists)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;

      if (!user) {
        // attempt to refresh and then process pendingAdd if success
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          await processPendingAdd(refreshed);
        }
      } else {
        // user exists (from localStorage) — try to process pendingAdd (will attempt refresh if needed)
        await processPendingAdd(user);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // When user changes (e.g., after login), attempt to process pendingAdd
  useEffect(() => {
    if (!user) return;
    (async () => {
      await processPendingAdd(user);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
