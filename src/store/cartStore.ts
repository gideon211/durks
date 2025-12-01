// src/store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

/**
 * Cart store
 * - keeps local and server state consistent
 * - always stores `packs` (array of {pack, price})
 * - optimistic updates for qty & pack, with safe fallbacks
 */

const axiosInstance = axios.create({
  baseURL: "https://duksshopback-end.onrender.com/api",
  timeout: 5000,
});

// AUTO-ADD TOKEN
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  }
  return config;
});

export interface Product {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  category?: string;
  size?: string;
  // optional packs when product is passed from frontend
  packs?: { pack: number; price: number }[];
}

export interface CartItem extends Product {
  id: string | number;
  drinkId: string | number;
  pack: number; // selected pack
  qty: number; // number of packs
  _local?: boolean;
  packs?: { pack: number; price: number }[];
}

interface CartState {
  cart: CartItem[];

  // persistence/user helpers
  loadCartForUser: (userId?: string | number | null) => Promise<void>;
  switchToGuestCart: () => void;
  mergeGuestIntoUser: (userId: string | number) => Promise<void>;
  saveToStorage: (items: CartItem[], userId?: string | number | null) => void;

  // API / actions
  fetchCart: () => Promise<void>;
  addToCart: (product: Partial<Product>, pack?: number, qty?: number) => Promise<void>;
  removeFromCart: (cartItemId: string | number) => Promise<void>;
  updateQty: (cartItemId: string | number, qty: number) => Promise<void>;
  updatePack: (cartItemId: string | number, pack: number) => Promise<void>;
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
 * perUserStorage for zustand/persist
 * stores under name:<uid> or name:guest
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
              const items: CartItem[] = (res.data?.cartItems || []).map((item: any) => {
                // Prefer Drink.packs (complete list) if provided by backend.
                const allPacks: { pack: number; price: number }[] =
                  Array.isArray(item?.Drink?.packs) && item.Drink.packs.length > 0
                    ? item.Drink.packs
                    : Array.isArray(item?.packs) && item.packs.length > 0
                    ? item.packs
                    : [{ pack: item.Drink?.pack ?? item.pack ?? 12, price: item.Drink?.price ?? item.price ?? 0 }];

                const selectedPack = item.pack ?? item.Drink?.pack ?? allPacks[0].pack;
                const selectedPrice = allPacks.find((p: any) => Number(p.pack) === Number(selectedPack))?.price ?? item.price ?? 0;

                return {
                  id: item._id ?? item.id,
                  drinkId: item.drinkId,
                  name: item.Drink?.name ?? item.name,
                  price: selectedPrice,
                  image: item.Drink?.imageUrl ?? item.Drink?.image ?? item.image ?? "",
                  qty: item.quantity ?? item.qty ?? 1,
                  pack: selectedPack,
                  packs: allPacks,
                } as CartItem;
              });

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

      /* ---------- Basic setters ---------- */

      setCart: (items) => {
        set({ cart: items });
        try {
          const uid = getUserIdFromLocalStorage();
          const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
          localStorage.setItem(key, JSON.stringify(items));
        } catch {}
      },

      /* ---------- Fetch / Add / Remove ---------- */

      fetchCart: async () => {
        try {
          const res = await axiosInstance.get("/cart");
          const items: CartItem[] = (res.data?.cartItems || []).map((item: any) => {
            const allPacks: { pack: number; price: number }[] =
              Array.isArray(item?.Drink?.packs) && item.Drink.packs.length > 0
                ? item.Drink.packs
                : Array.isArray(item?.packs) && item.packs.length > 0
                ? item.packs
                : [{ pack: item.Drink?.pack ?? item.pack ?? 12, price: item.Drink?.price ?? item.price ?? 0 }];

            const selectedPack = item.pack ?? item.Drink?.pack ?? allPacks[0].pack;
            const selectedPrice = allPacks.find((p: any) => Number(p.pack) === Number(selectedPack))?.price ?? item.price ?? 0;

            return {
              id: item._id ?? item.id,
              drinkId: item.drinkId,
              name: item.Drink?.name ?? item.name,
              price: selectedPrice,
              image: item.Drink?.imageUrl ?? item.Drink?.image ?? item.image ?? "",
              qty: item.quantity ?? item.qty ?? 1,
              pack: selectedPack,
              packs: allPacks,
            } as CartItem;
          });

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
        // product may be from ProductCard (with packs array) or a minimal product
        const existingItem = get().cart.find((i) => String(i.drinkId) === String(product.id) && Number(i.pack) === Number(pack));

        const createLocalItem = () => {
          if (existingItem) {
            const updated = get().cart.map((item) =>
              String(item.drinkId) === String(product.id) && Number(item.pack) === Number(pack)
                ? { ...item, qty: item.qty + qty }
                : item
            );
            set({ cart: updated });
            try {
              const uid = getUserIdFromLocalStorage();
              const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
              localStorage.setItem(key, JSON.stringify(updated));
            } catch {}
            return;
          }

          const packsFromProduct = Array.isArray((product as any).packs) ? (product as any).packs : [];

          const priceForPack =
            packsFromProduct.find((p: any) => Number(p.pack) === Number(pack))?.price ??
            (product as any).price ??
            0;

          const localItem: CartItem = {
            id: `local-${Date.now()}`,
            drinkId: product.id!,
            name: product.name ?? "Item",
            price: priceForPack,
            image: product.image,
            pack,
            qty,
            packs: packsFromProduct.length ? packsFromProduct : [{ pack, price: priceForPack }],
            _local: true,
          };

          const updated = [...get().cart, localItem];
          set({ cart: updated });
          try {
            const uid = getUserIdFromLocalStorage();
            const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
            localStorage.setItem(key, JSON.stringify(updated));
          } catch {}
        };

        if (!navigator.onLine) {
          createLocalItem();
          return;
        }

        try {
          if (existingItem && !existingItem._local) {
            // existing on server: update quantity (PUT or PATCH depending on your backend)
            await axiosInstance.put(`/cart/${existingItem.id}`, {
              quantity: existingItem.qty + qty,
              pack,
            });

            const updated = get().cart.map((item) =>
              String(item.drinkId) === String(product.id) && Number(item.pack) === Number(pack)
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
            // create on server
            const res = await axiosInstance.post("/cart", {
              drinkId: product.id,
              quantity: qty,
              pack,
            });

            const item = res.data.cartItem;
            const serverPacks = Array.isArray(item?.Drink?.packs) && item.Drink.packs.length > 0
              ? item.Drink.packs
              : Array.isArray((product as any).packs) && (product as any).packs.length > 0
              ? (product as any).packs
              : [{ pack: item?.pack ?? pack, price: item?.Drink?.price ?? (product as any).price ?? 0 }];

            const priceForPack =
              serverPacks.find((p: any) => Number(p.pack) === Number(item.pack ?? pack))?.price ??
              item.Drink?.price ??
              (product as any).price ??
              0;

            const newItem: CartItem = {
              id: item._id ?? item.id,
              drinkId: item.drinkId,
              name: item.Drink?.name ?? (product as any).name ?? "Item",
              price: priceForPack,
              image: item.Drink?.imageUrl ?? item.Drink?.image ?? (product as any).image ?? "",
              pack: item.pack ?? pack,
              qty: item.quantity ?? qty,
              packs: serverPacks,
            };

            const updated = existingItem
              ? get().cart.map((i) =>
                  String(i.drinkId) === String(product.id) && Number(i.pack) === Number(pack)
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
        const item = current.find((i) => String(i.id) === String(cartItemId));
        if (!item) return;

        if (typeof cartItemId === "string" && String(cartItemId).startsWith("local-")) {
          const updated = current.filter((i) => String(i.id) !== String(cartItemId));
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
          const updated = current.filter((i) => String(i.id) !== String(cartItemId));
          set({ cart: updated });
          try {
            const uid = getUserIdFromLocalStorage();
            const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
            localStorage.setItem(key, JSON.stringify(updated));
          } catch {}
        } catch (err) {
          console.warn("Remove failed, removing locally:", err);
          const updated = current.filter((i) => String(i.id) !== String(cartItemId));
          set({ cart: updated });
          try {
            const uid = getUserIdFromLocalStorage();
            const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
            localStorage.setItem(key, JSON.stringify(updated));
          } catch {}
        }
      },

      /* ---------- Update quantity ---------- */

      updateQty: async (cartItemId: string, qty: number) => {
        if (qty <= 0) return;

        const updateLocal = (items?: CartItem[]) => {
          const base = items ?? get().cart;
          const updated = base.map((item) =>
            String(item.id) === String(cartItemId) ? { ...item, qty } : item
          );
          set({ cart: updated });
          try {
            const uid = getUserIdFromLocalStorage();
            const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
            localStorage.setItem(key, JSON.stringify(updated));
          } catch {}
        };

        // local-only item
        if (String(cartItemId).startsWith("local-")) {
          updateLocal();
          return;
        }

        // optimistic
        updateLocal();

        try {
          await axiosInstance.patch(`/cart/${cartItemId}/quantity`, { quantity: qty });
        } catch (err) {
          console.warn("Failed to update quantity on server:", err);
          // already updated locally (optimistic), no further action
        }
      },

      /* ---------- Update pack (tries server then falls back) ---------- */

      updatePack: async (cartItemId: string, pack: number) => {
        const updateLocal = (newPack?: number, newPrice?: number) => {
          const updated = get().cart.map((item) => {
            if (String(item.id) !== String(cartItemId)) return item;
            const packs = item.packs ?? [];
            const price = newPrice ?? packs.find((p) => Number(p.pack) === Number(newPack ?? pack))?.price ?? item.price;
            return {
              ...item,
              pack: newPack ?? pack,
              price,
            };
          });
          set({ cart: updated });
          try {
            const uid = getUserIdFromLocalStorage();
            const key = uid ? `${USER_KEY_PREFIX}${uid}` : `${"cart-storage"}:${GUEST_SUFFIX}`;
            localStorage.setItem(key, JSON.stringify(updated));
          } catch {}
        };

        // local-only
        if (String(cartItemId).startsWith("local-")) {
          updateLocal(pack);
          return;
        }

        // optimistic
        updateLocal(pack);

        try {
          // try dedicated pack endpoint
          await axiosInstance.patch(`/cart/${cartItemId}/pack`, { pack });
          // optionally you could read server response and merge, but optimistic is fine
        } catch (err) {
          // If dedicated endpoint not found, try updating via put to the cart item
          try {
            await axiosInstance.put(`/cart/${cartItemId}`, { pack });
          } catch (err2) {
            console.warn("Update pack failed on server (tried patch then put):", err, err2);
            // already updated locally, so continue
          }
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

      totalQty: () => get().cart.reduce((sum, item) => sum + (item.qty || 0), 0),

      totalPrice: () => get().cart.reduce((sum, item) => sum + ((item.price ?? 0) * (item.qty ?? 0)), 0),

      /* ---------- Sync offline local items ---------- */

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
            const allPacks: { pack: number; price: number }[] =
              Array.isArray(saved?.Drink?.packs) && saved.Drink.packs.length > 0
                ? saved.Drink.packs
                : item.packs && item.packs.length > 0
                ? item.packs
                : [{ pack: saved?.pack ?? item.pack, price: saved?.Drink?.price ?? item.price ?? 0 }];

            const syncedItem: CartItem = {
              id: saved._id ?? saved.id,
              drinkId: saved.drinkId,
              name: saved.Drink?.name ?? item.name,
              price: allPacks.find((p) => Number(p.pack) === Number(saved.pack ?? item.pack))?.price ?? item.price,
              image: saved.Drink?.imageUrl ?? saved.Drink?.image ?? item.image ?? "",
              pack: saved.pack ?? item.pack,
              qty: saved.quantity ?? item.qty,
              packs: allPacks,
            };

            // replace local id entry with synced item
            set({
              cart: get().cart.map((i) => (String(i.id) === String(item.id) ? syncedItem : i)),
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

// Sync offline cart when back online (attempt to sync local items)
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

export default useCartStore;
