// src/store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

/**
 * NOTE:
 * - Adjust baseURL below to your real backend or swap to your shared axios instance.
 * - This file assumes auth tokens are attached elsewhere (axios interceptors)
 */
const axiosInstance = axios.create({
  baseURL: "https://your-backend-url",
  timeout: 5000,
});

export interface Product {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  category?: string;
  size?: string;
}

export interface CartItem extends Product {
  id: string | number;
  drinkId: string | number;
  pack: number; // number of items per pack
  qty: number; // number of packs
  _local?: boolean;
}

interface CartState {
  cart: CartItem[];

  // persistence/user helpers
  loadCartForUser: (userId?: string | number | null) => Promise<void>;
  switchToGuestCart: () => void;
  mergeGuestIntoUser: (userId: string | number) => Promise<void>;
  saveToStorage: (items: CartItem[], userId?: string | number | null) => void;

  // existing API / actions
  fetchCart: () => Promise<void>;
  addToCart: (product: Product, pack?: number, qty?: number) => Promise<void>;
  removeFromCart: (cartItemId: string | number) => Promise<void>;
  updateQty: (cartItemId: string | number, qty: number) => Promise<void>;
  clearCart: () => void;
  totalQty: () => number;
  totalPrice: () => number;
  setCart: (items: CartItem[]) => void;
  syncLocalItems: () => Promise<void>;
}

const GUEST_SUFFIX = "guest";
const USER_KEY_PREFIX = "cart:user:";

/** Read user id (string) from localStorage "user" entry (if present) */
function getUserIdFromLocalStorage(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id ? String(parsed.id) : null;
  } catch {
    return null;
  }
}

/**
 * perUserStorage
 * - uses the `name` passed by zustand/persist as a base
 * - writes to: `${name}:<userId>` when a user exists OR `${name}:guest` otherwise
 * - guards against server-side usage by checking window
 */
const perUserStorage = {
  getItem: (name: string) => {
    try {
      if (typeof window === "undefined") return null;
      const uid = getUserIdFromLocalStorage();
      const key = uid ? `${name}:${uid}` : `${name}:${GUEST_SUFFIX}`;
      return localStorage.getItem(key);
    } catch (err) {
      console.warn(`[persist] getItem failed for ${name}`, err);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      if (typeof window === "undefined") return;
      const uid = getUserIdFromLocalStorage();
      const key = uid ? `${name}:${uid}` : `${name}:${GUEST_SUFFIX}`;
      localStorage.setItem(key, value);
    } catch (err) {
      console.warn(`[persist] setItem failed for ${name}`, err);
    }
  },
  removeItem: (name: string) => {
    try {
      if (typeof window === "undefined") return;
      const uid = getUserIdFromLocalStorage();
      const key = uid ? `${name}:${uid}` : `${name}:${GUEST_SUFFIX}`;
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[persist] removeItem failed for ${name}`, err);
    }
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      /* ---------- Persistence helpers ---------- */

      loadCartForUser: async (userId) => {
        try {
          // If offline, load local fallback and skip network attempt
          if (!navigator.onLine) {
            if (typeof window !== "undefined") {
              const key = userId ? `${USER_KEY_PREFIX}${userId}` : `${"cart-storage"}:${getUserIdFromLocalStorage() ?? GUEST_SUFFIX}`;
              const raw = localStorage.getItem(key);
              if (raw) {
                const items = JSON.parse(raw) as CartItem[];
                set({ cart: items });
                return;
              }
            }
            set({ cart: [] });
            return;
          }

          // Online + userId -> prefer server
          if (userId) {
            try {
              const res = await axiosInstance.get("/cart");
              const items: CartItem[] = (res.data?.cartItems || []).map((item: any) => ({
                id: item.id,
                drinkId: item.drinkId,
                name: item.Drink?.name ?? item.name,
                price: item.Drink?.price ?? item.price,
                image: item.Drink?.image ?? item.image,
                qty: item.quantity ?? item.qty ?? 1,
                pack: item.pack ?? 12,
              }));
              set({ cart: items });
              get().saveToStorage(items, userId);
              return;
            } catch (err: any) {
              // Network or server problem -> fallback to local storage
              if (err?.code === "ERR_NETWORK" || err?.message === "Network Error") {
                console.warn("[cart] network error fetching server cart — falling back to local");
              } else {
                console.warn("[cart] failed to fetch server cart — falling back to local:", err?.message ?? err);
              }
            }
          }

          // Local fallback: user-specific key or perUserStorage
          if (typeof window !== "undefined") {
            const key = userId ? `${USER_KEY_PREFIX}${userId}` : `${"cart-storage"}:${getUserIdFromLocalStorage() ?? GUEST_SUFFIX}`;
            const raw = localStorage.getItem(key);
            if (raw) {
              const items = JSON.parse(raw) as CartItem[];
              set({ cart: items });
              return;
            }
          }

          set({ cart: [] });
        } catch (err) {
          console.error("loadCartForUser error:", err);
          set({ cart: [] });
        }
      },

      switchToGuestCart: () => {
        try {
          if (typeof window === "undefined") {
            set({ cart: [] });
            return;
          }

          // persist current cart to its current key
          const current = get().cart;
          try {
            const uid = getUserIdFromLocalStorage();
            const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
            localStorage.setItem(key, JSON.stringify(current));
          } catch {}

          // load guest
          const guestRaw = localStorage.getItem(`${"cart-storage"}:${GUEST_SUFFIX}`);
          if (guestRaw) {
            const guest = JSON.parse(guestRaw) as CartItem[];
            set({ cart: guest });
          } else {
            set({ cart: [] });
          }
        } catch (err) {
          console.warn("switchToGuestCart failed:", err);
          set({ cart: [] });
        }
      },

      mergeGuestIntoUser: async (userId) => {
        if (!userId) return;
        try {
          if (typeof window === "undefined") return;

          const guestRaw = localStorage.getItem(`${"cart-storage"}:${GUEST_SUFFIX}`);
          const guest: CartItem[] = guestRaw ? JSON.parse(guestRaw) : [];

          const current = get().cart || [];

          const map = new Map<string, CartItem>();
          const keyFor = (ci: CartItem) => `${ci.drinkId}::${ci.pack}`;

          current.forEach((c) => map.set(keyFor(c), { ...c }));
          guest.forEach((g) => {
            const k = keyFor(g);
            if (map.has(k)) {
              const existing = map.get(k)!;
              map.set(k, { ...existing, qty: (existing.qty || 0) + (g.qty || 0) });
            } else {
              map.set(k, { ...g });
            }
          });

          const merged = Array.from(map.values());
          set({ cart: merged });

          // persist under user key
          get().saveToStorage(merged, userId);

          // clear guest
          localStorage.removeItem(`${"cart-storage"}:${GUEST_SUFFIX}`);

          if (navigator.onLine) {
            await get().syncLocalItems();
          }
        } catch (err) {
          console.warn("mergeGuestIntoUser failed:", err);
        }
      },

      saveToStorage: (items, userId) => {
        try {
          if (typeof window === "undefined") return;
          if (userId) {
            localStorage.setItem(`${USER_KEY_PREFIX}${userId}`, JSON.stringify(items));
          } else {
            const uid = getUserIdFromLocalStorage();
            const dstKey = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
            localStorage.setItem(dstKey, JSON.stringify(items));
          }
        } catch {
          // ignore
        }
      },

      /* ---------- Existing actions (persist to per-user storage after modifications) ---------- */

      setCart: (items) => {
        set({ cart: items });
        try {
          const uid = getUserIdFromLocalStorage();
          const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
          localStorage.setItem(key, JSON.stringify(items));
        } catch {}
      },

      fetchCart: async () => {
        try {
          const res = await axiosInstance.get("/cart");
          const items: CartItem[] = (res.data?.cartItems || []).map((item: any) => ({
            id: item.id,
            drinkId: item.drinkId,
            name: item.Drink?.name ?? item.name,
            price: item.Drink?.price ?? item.price,
            image: item.Drink?.image ?? item.image,
            qty: item.quantity ?? item.qty ?? 1,
            pack: item.pack || 12,
          }));
          set({ cart: items });
          try {
            const uid = getUserIdFromLocalStorage();
            const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
            localStorage.setItem(key, JSON.stringify(items));
          } catch {}
        } catch (err) {
          console.error("Fetch cart failed:", err);
        }
      },

      addToCart: async (product, pack = 12, qty = 1) => {
        const existingItem = get().cart.find(
          (i) => i.drinkId === product.id && i.pack === pack
        );

        const createLocalItem = () => {
          if (existingItem) {
            const updated = get().cart.map((item) =>
              item.drinkId === product.id && item.pack === pack
                ? { ...item, qty: item.qty + qty }
                : item
            );
            set({ cart: updated });
            try {
              const uid = getUserIdFromLocalStorage();
              const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
              localStorage.setItem(key, JSON.stringify(updated));
            } catch {}
          } else {
            const localItem: CartItem = {
              id: `local-${Date.now()}`,
              drinkId: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              pack,
              qty,
              _local: true,
            };
            const updated = [...get().cart, localItem];
            set({ cart: updated });
            try {
              const uid = getUserIdFromLocalStorage();
              const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
              localStorage.setItem(key, JSON.stringify(updated));
            } catch {}
          }
        };

        if (!navigator.onLine) {
          createLocalItem();
          return;
        }

        try {
          if (existingItem && !existingItem._local) {
            await axiosInstance.put(`/cart/${existingItem.id}`, {
              quantity: existingItem.qty + qty,
              pack,
            });
            const updated = get().cart.map((item) =>
              item.drinkId === product.id && item.pack === pack
                ? { ...item, qty: item.qty + qty }
                : item
            );
            set({ cart: updated });
            try {
              const uid = getUserIdFromLocalStorage();
              const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
              localStorage.setItem(key, JSON.stringify(updated));
            } catch {}
          } else {
            const res = await axiosInstance.post("/cart", {
              drinkId: product.id,
              quantity: qty,
              pack,
            });

            const item = res.data.cartItem;
            const newItem: CartItem = {
              id: item.id,
              drinkId: item.drinkId,
              name: item.Drink?.name ?? product.name,
              price: item.Drink?.price ?? product.price,
              image: item.Drink?.image ?? product.image,
              pack: item.pack || pack,
              qty: item.quantity,
            };

            const updated = existingItem
              ? get().cart.map((i) =>
                  i.drinkId === product.id && i.pack === pack
                    ? { ...i, qty: i.qty + qty }
                    : i
                )
              : [...get().cart, newItem];

            set({ cart: updated });
            try {
              const uid = getUserIdFromLocalStorage();
              const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
              localStorage.setItem(key, JSON.stringify(updated));
            } catch {}
          }
        } catch (err) {
          console.warn("Add to cart failed, using local fallback:", err);
          createLocalItem();
        }
      },

      removeFromCart: async (cartItemId) => {
        const current = get().cart;
        const item = current.find((i) => i.id === cartItemId);
        if (!item) return;

        if (typeof cartItemId === "string" && cartItemId.startsWith("local-")) {
          const updated = current.filter((i) => i.id !== cartItemId);
          set({ cart: updated });
          try {
            const uid = getUserIdFromLocalStorage();
            const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
            localStorage.setItem(key, JSON.stringify(updated));
          } catch {}
          return;
        }

        try {
          await axiosInstance.delete(`/cart/${cartItemId}`);
          const updated = current.filter((i) => i.id !== cartItemId);
          set({ cart: updated });
          try {
            const uid = getUserIdFromLocalStorage();
            const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
            localStorage.setItem(key, JSON.stringify(updated));
          } catch {}
        } catch (err) {
          console.warn("Remove failed, removing locally:", err);
          const updated = current.filter((i) => i.id !== cartItemId);
          set({ cart: updated });
          try {
            const uid = getUserIdFromLocalStorage();
            const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
            localStorage.setItem(key, JSON.stringify(updated));
          } catch {}
        }
      },

      updateQty: async (cartItemId, qty) => {
        if (qty <= 0) return;

        const updateLocal = () => {
          const updated = get().cart.map((item) =>
            item.id === cartItemId ? { ...item, qty } : item
          );
          set({ cart: updated });
          try {
            const uid = getUserIdFromLocalStorage();
            const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
            localStorage.setItem(key, JSON.stringify(updated));
          } catch {}
        };

        if (typeof cartItemId === "string" && cartItemId.startsWith("local-")) {
          updateLocal();
          return;
        }

        try {
          await axiosInstance.put(`/cart/${cartItemId}`, { quantity: qty });
          updateLocal();
        } catch (err) {
          console.warn("Update failed, updating locally:", err);
          updateLocal();
        }
      },

      clearCart: () => {
        set({ cart: [] });
        try {
          const uid = getUserIdFromLocalStorage();
          const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
          localStorage.removeItem(key);
        } catch {}
      },

      totalQty: () => get().cart.reduce((sum, item) => sum + item.qty, 0),

      totalPrice: () =>
        get().cart.reduce((sum, item) => sum + item.price * item.qty * item.pack, 0),

      syncLocalItems: async () => {
        const localItems = get().cart.filter((i) => i._local);
        if (localItems.length === 0) return;

        try {
          for (const item of localItems) {
            const res = await axiosInstance.post("/cart", {
              drinkId: item.drinkId,
              quantity: item.qty,
              pack: item.pack,
            });

            const saved = res.data.cartItem;
            const syncedItem: CartItem = {
              id: saved.id,
              drinkId: saved.drinkId,
              name: saved.Drink?.name ?? item.name,
              price: saved.Drink?.price ?? item.price,
              image: saved.Drink?.image ?? item.image,
              pack: saved.pack || item.pack,
              qty: saved.quantity,
            };

            set({
              cart: get().cart.map((i) => (i.id === item.id ? syncedItem : i)),
            });
          }

          try {
            const uid = getUserIdFromLocalStorage();
            const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
            localStorage.setItem(key, JSON.stringify(get().cart));
          } catch {}
        } catch (err) {
          console.warn("Failed to sync offline cart:", err);
        }
      },
    }),
    {
    name: "cart-storage",
    storage: perUserStorage as any,
    }

  )
);

// Sync offline cart when back online
if (typeof window !== "undefined") {
  window.addEventListener("online", async () => {
    const store = useCartStore.getState();
    try {
      await store.syncLocalItems();
    } catch {
      // ignore
    }
  });
}
