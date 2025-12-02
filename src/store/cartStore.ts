// src/store/cartStore.ts
import { create } from "zustand";
import axios from "axios";

/**
 * Simplified Cart store that relies entirely on backend endpoints.
 * - No local/offline sync, no per-user localStorage keys.
 * - All mutations call backend endpoints; state is updated from server responses.
 *
 * Expected backend endpoints used here:
 * GET    /cart                -> { cartItems: [...] } OR { cart: [...] }
 * POST   /cart                -> create item (body: { drinkId, quantity, pack }) -> returns cartItem
 * PUT    /cart/:cartItemId    -> update cart item fully
 * PATCH  /cart/:cartItemId/quantity -> update quantity
 * PATCH  /cart/:cartItemId/pack     -> update pack
 * DELETE /cart/:cartItemId     -> delete single cart item
 * DELETE /cart                 -> clear entire cart (if supported)
 *
 * Adjust endpoints if your backend routes differ.
 */

export interface Product {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  category?: string;
  size?: string;
  packs?: { pack: number; price: number }[];
  pack?: number | string;
  qty?: number;
}

export interface CartItem extends Product {
  id: string | number; // cart item id (server)
  drinkId: string | number; // product id
  pack: number | string;
  qty: number;
  packs?: { pack: number; price: number }[];
}

interface CartState {
  cart: CartItem[];

  // API / actions
  fetchCart: () => Promise<void>;
  addToCart: (
    productOrId: string | number | Product | any,
    pack?: number | string,
    qty?: number
  ) => Promise<void>;
  removeFromCart: (cartItemId: string | number) => Promise<void>;
  updateQty: (cartItemId: string | number, qty: number) => Promise<void>;
  updatePack: (cartItemId: string | number, pack: number | string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalQty: () => number;
  totalPrice: () => number;
  setCart: (items: CartItem[]) => void;

  // Added for Authcontext usage
  loadCartForUser: (userId: string) => Promise<void>;
  mergeGuestIntoUser: (userId: string) => Promise<void>;
  switchToGuestCart: () => void;
}

const axiosInstance = axios.create({
  baseURL: "https://duksshopback-end.onrender.com/api",
  timeout: 5000,
});

// AUTO-ADD TOKEN
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser);
        if (user?.token) {
          // Ensure headers exist and are typed correctly
          config.headers = config.headers ?? {} as any; 
          (config.headers as any).Authorization = `Bearer ${user.token}`;
        }
      } catch {}
    }
  }
  return config;
});


function mapServerCartItem(item: any): CartItem {
  // Defensive mapping for different shapes returned by backend
  const drink = item?.Drink ?? {};
  const packsFromServer: { pack: number; price: number }[] =
    Array.isArray(drink?.packs) && drink.packs.length > 0
      ? drink.packs
      : Array.isArray(item?.packs) && item.packs.length > 0
      ? item.packs
      : [];

  const selectedPack =
    item.pack ??
    drink.pack ??
    (packsFromServer[0] && packsFromServer[0].pack) ??
    (typeof item.pack !== "undefined" ? item.pack : 12);

  const price =
    (packsFromServer.length
      ? packsFromServer.find((p) => String(p.pack) === String(selectedPack))?.price
      : undefined) ??
    item.price ??
    drink.price ??
    0;

  return {
    id: item._id ?? item.id,
    drinkId: item.drinkId ?? drink._id ?? item.productId ?? null,
    name: drink.name ?? item.name ?? "Item",
    price: Number(price),
    image: drink.imageUrl ?? drink.image ?? item.image ?? "",
    qty: item.quantity ?? item.qty ?? 1,
    pack: selectedPack,
    packs: packsFromServer.length ? packsFromServer : undefined,
  } as CartItem;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],

  setCart: (items) => {
    set({ cart: items });
  },

  fetchCart: async () => {
    try {
      const res = await axiosInstance.get("/cart");
      const serverItems = res.data?.cartItems ?? res.data?.cart ?? res.data?.items ?? [];
      const items: CartItem[] = (Array.isArray(serverItems) ? serverItems : []).map(mapServerCartItem);
      set({ cart: items });
    } catch (err) {
      console.error("fetchCart failed:", err);
      // Keep existing cart if fetch fails
    }
  },

  /**
   * addToCart accepts:
   * - id (string|number)
   * - or a product object that contains at least `id` or `drinkId`
   *
   * It will call POST /cart with { drinkId, quantity, pack } and then refresh cart.
   */
  addToCart: async (productOrId, pack = 12, qty = 1) => {
    try {
      // Normalize input
      let drinkId: string | number | null = null;
      let quantity = qty;
      let packToSend = pack;

      if (typeof productOrId === "object" && productOrId !== null) {
        drinkId = productOrId.id ?? productOrId.drinkId ?? null;
        // allow passing qty inside object
        quantity = productOrId.qty ?? productOrId.quantity ?? quantity;
        packToSend = productOrId.pack ?? packToSend;
      } else {
        drinkId = productOrId;
      }

      if (!drinkId) {
        throw new Error("Invalid product id");
      }

      await axiosInstance.post("/cart", {
        drinkId,
        quantity,
        pack: packToSend,
      });

      // refresh local cart
      await get().fetchCart();
    } catch (err) {
      console.error("addToCart failed:", err);
      throw err;
    }
  },

  removeFromCart: async (cartItemId) => {
    try {
      await axiosInstance.delete(`/cart/${cartItemId}`);
      // update local state by filtering
      set({ cart: get().cart.filter((i) => String(i.id) !== String(cartItemId)) });
    } catch (err) {
      console.error("removeFromCart failed:", err);
      // attempt local state update anyway
      set({ cart: get().cart.filter((i) => String(i.id) !== String(cartItemId)) });
    }
  },

  updateQty: async (cartItemId, qty) => {
    if (qty <= 0) return;
    try {
      // optimistic local update
      set({
        cart: get().cart.map((item) =>
          String(item.id) === String(cartItemId) ? { ...item, qty } : item
        ),
      });

      // send to server
      // try patch endpoint first, else fallback to put
      try {
        await axiosInstance.patch(`/cart/${cartItemId}/quantity`, { quantity: qty });
      } catch {
        await axiosInstance.put(`/cart/${cartItemId}`, { quantity: qty });
      }
    } catch (err) {
      console.error("updateQty failed:", err);
      // optionally re-fetch cart to reconcile
      await get().fetchCart();
    }
  },

  updatePack: async (cartItemId, pack) => {
    try {
      // optimistic update local price/pack if packs available
      set({
        cart: get().cart.map((item) => {
          if (String(item.id) !== String(cartItemId)) return item;
          const packs = item.packs ?? [];
          const price = packs.find((p) => String(p.pack) === String(pack))?.price ?? item.price;
          return { ...item, pack, price };
        }),
      });

      // send to server: try dedicated patch, then put
      try {
        await axiosInstance.patch(`/cart/${cartItemId}/pack`, { pack });
      } catch {
        await axiosInstance.put(`/cart/${cartItemId}`, { pack });
      }
    } catch (err) {
      console.error("updatePack failed:", err);
      await get().fetchCart();
    }
  },

  clearCart: async () => {
    try {
      // attempt to clear on backend (assumes DELETE /cart clears entire cart)
      await axiosInstance.delete("/cart");
    } catch (err) {
      console.warn("clearCart backend call failed (server may not support bulk delete):", err);
      // If backend doesn't support bulk delete, you may choose to delete items individually:
      // await Promise.all(get().cart.map(i => axiosInstance.delete(`/cart/${i.id}`)));
    } finally {
      // always clear local view
      set({ cart: [] });
    }
  },

  totalQty: () => get().cart.reduce((sum, item) => sum + (item.qty || 0), 0),

  totalPrice: () => get().cart.reduce((sum, item) => sum + ((item.price ?? 0) * (item.qty ?? 0)), 0),

  // ---------------- Auth/context helpers ----------------
  loadCartForUser: async (userId: string) => {
    try {
      // Prefer server-side load (server usually uses auth token)
      // If your server accepts a userId query param, this will try it; otherwise fallback to fetchCart
      try {
        const res = await axiosInstance.get(`/cart?userId=${userId}`);
        const serverItems = res.data?.cartItems ?? res.data?.cart ?? res.data?.items ?? [];
        const items: CartItem[] = (Array.isArray(serverItems) ? serverItems : []).map(mapServerCartItem);
        set({ cart: items });
      } catch (err) {
        // fallback to normal fetchCart which may use token to identify user
        await get().fetchCart();
      }
    } catch (err) {
      console.error("loadCartForUser failed:", err);
    }
  },

  mergeGuestIntoUser: async (userId: string) => {
    try {
      // Look for a guest cart saved in localStorage
      const raw = typeof window !== "undefined" ? localStorage.getItem("pendingCart") : null;
      if (!raw) return;
      const guestCart = JSON.parse(raw) as any[];
      if (!Array.isArray(guestCart) || guestCart.length === 0) {
        localStorage.removeItem("pendingCart");
        return;
      }

      // Convert guestCart items to server requests
      const promises = guestCart.map((item) => {
        const drinkId = item.drinkId ?? item.id ?? item.productId ?? null;
        const quantity = item.qty ?? item.quantity ?? 1;
        const pack = item.pack ?? (Array.isArray(item.packs) && item.packs[0]?.pack) ?? 12;
        if (!drinkId) return Promise.resolve(null);
        return axiosInstance.post("/cart", { drinkId, quantity, pack }).catch((e) => {
          console.warn("merge guest item failed for", drinkId, e);
        });
      });

      await Promise.all(promises);
      localStorage.removeItem("pendingCart");
      // refresh cart after merge
      await get().fetchCart();
    } catch (err) {
      console.error("mergeGuestIntoUser failed:", err);
    }
  },

  switchToGuestCart: () => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("pendingCart") : null;
      if (!raw) {
        set({ cart: [] });
        return;
      }
      const guestCart = JSON.parse(raw) as any[];
      const items: CartItem[] = (Array.isArray(guestCart) ? guestCart : []).map((i) => {
        // try to ensure consistent shape
        return {
          id: i.id ?? i._id ?? `${i.drinkId ?? i.id ?? Math.random()}`,
          drinkId: i.drinkId ?? i.id ?? null,
          name: i.name ?? i.productName ?? "Item",
          price: Number(i.price ?? (i.packs && i.packs[0]?.price) ?? 0),
          image: i.image ?? "",
          qty: i.qty ?? i.quantity ?? 1,
          pack: i.pack ?? (i.packs && i.packs[0]?.pack) ?? 12,
          packs: i.packs ?? undefined,
        } as CartItem;
      });
      set({ cart: items });
    } catch (err) {
      console.error("switchToGuestCart failed:", err);
      set({ cart: [] });
    }
  },
}));
