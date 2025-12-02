// src/store/cartStore.ts
import { create } from "zustand";
import axiosInstance from "@/api/axios"; // <-- use your shared axios instance

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

  loadCartForUser: (userId: string) => Promise<void>;
  mergeGuestIntoUser: (userId: string) => Promise<void>;
  switchToGuestCart: () => void;
}

function mapServerCartItem(item: any): CartItem {
  const drink = item?.Drink ?? {};
  const packsFromServer: { pack: number; price: number }[] =
    Array.isArray(drink?.packs) && drink.packs.length > 0
      ? drink.packs
      : Array.isArray(item?.packs) && item.packs.length > 0
      ? item.packs
      : [];

  const selectedPack =
    item.pack ?? drink.pack ?? (packsFromServer[0] && packsFromServer[0].pack) ?? 12;

  const price =
    (packsFromServer.length
      ? packsFromServer.find((p) => String(p.pack) === String(selectedPack))?.price
      : undefined) ?? item.price ?? drink.price ?? 0;

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

  setCart: (items) => set({ cart: items }),

  fetchCart: async () => {
    try {
      const res = await axiosInstance.get("/cart");
      const serverItems = res.data?.cartItems ?? res.data?.cart ?? res.data?.items ?? [];
      const items: CartItem[] = (Array.isArray(serverItems) ? serverItems : []).map(mapServerCartItem);
      set({ cart: items });
    } catch (err) {
      console.error("fetchCart failed:", err);
    }
  },

  addToCart: async (productOrId, pack = 12, qty = 1) => {
    try {
      let drinkId: string | number | null = null;
      let quantity = qty;
      let packToSend = pack;

      if (typeof productOrId === "object" && productOrId !== null) {
        drinkId = productOrId.id ?? productOrId.drinkId ?? null;
        quantity = productOrId.qty ?? productOrId.quantity ?? quantity;
        packToSend = productOrId.pack ?? packToSend;
      } else {
        drinkId = productOrId;
      }

      if (!drinkId) throw new Error("Invalid product id");

      await axiosInstance.post("/cart", { drinkId, quantity, pack: packToSend });
      await get().fetchCart();
    } catch (err) {
      console.error("addToCart failed:", err);
      throw err;
    }
  },

  removeFromCart: async (cartItemId) => {
    try {
      await axiosInstance.delete(`/cart/${cartItemId}`);
    } catch (err) {
      console.warn("removeFromCart backend delete failed:", err);
    } finally {
      set({ cart: get().cart.filter((i) => String(i.id) !== String(cartItemId)) });
    }
  },

  updateQty: async (cartItemId, qty) => {
    if (qty <= 0) return;
    try {
      set({
        cart: get().cart.map((item) =>
          String(item.id) === String(cartItemId) ? { ...item, qty } : item
        ),
      });
      try {
        await axiosInstance.patch(`/cart/${cartItemId}/quantity`, { quantity: qty });
      } catch {
        await axiosInstance.put(`/cart/${cartItemId}`, { quantity: qty });
      }
    } catch (err) {
      console.error("updateQty failed:", err);
      await get().fetchCart();
    }
  },

  updatePack: async (cartItemId, pack) => {
    try {
      set({
        cart: get().cart.map((item) => {
          if (String(item.id) !== String(cartItemId)) return item;
          const packs = item.packs ?? [];
          const price = packs.find((p) => String(p.pack) === String(pack))?.price ?? item.price;
          return { ...item, pack, price };
        }),
      });
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
      await axiosInstance.delete("/cart");
    } catch (err) {
      console.warn("clearCart backend call failed:", err);
    } finally {
      set({ cart: [] });
    }
  },

  totalQty: () => get().cart.reduce((sum, item) => sum + (item.qty || 0), 0),

  totalPrice: () =>
    get().cart.reduce((sum, item) => sum + ((item.price ?? 0) * (item.qty ?? 0)), 0),

  loadCartForUser: async (userId: string) => {
    try {
      const res = await axiosInstance.get(`/cart?userId=${userId}`);
      const serverItems = res.data?.cartItems ?? res.data?.cart ?? res.data?.items ?? [];
      const items: CartItem[] = (Array.isArray(serverItems) ? serverItems : []).map(mapServerCartItem);
      set({ cart: items });
    } catch (err) {
      console.error("loadCartForUser failed:", err);
      await get().fetchCart();
    }
  },

  mergeGuestIntoUser: async (userId: string) => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("pendingCart") : null;
      if (!raw) return;
      const guestCart = JSON.parse(raw) as any[];
      if (!Array.isArray(guestCart) || guestCart.length === 0) {
        localStorage.removeItem("pendingCart");
        return;
      }

      await Promise.all(
        guestCart.map((item) => {
          const drinkId = item.drinkId ?? item.id ?? item.productId ?? null;
          const quantity = item.qty ?? item.quantity ?? 1;
          const pack = item.pack ?? (Array.isArray(item.packs) && item.packs[0]?.pack) ?? 12;
          if (!drinkId) return Promise.resolve(null);
          return axiosInstance.post("/cart", { drinkId, quantity, pack }).catch((e) => {
            console.warn("merge guest item failed for", drinkId, e);
          });
        })
      );

      localStorage.removeItem("pendingCart");
      await get().fetchCart();
    } catch (err) {
      console.error("mergeGuestIntoUser failed:", err);
    }
  },

  switchToGuestCart: () => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("pendingCart") : null;
      if (!raw) return set({ cart: [] });

      const guestCart = JSON.parse(raw) as any[];
      const items: CartItem[] = (Array.isArray(guestCart) ? guestCart : []).map((i) => ({
        id: i.id ?? i._id ?? `${i.drinkId ?? i.id ?? Math.random()}`,
        drinkId: i.drinkId ?? i.id ?? null,
        name: i.name ?? i.productName ?? "Item",
        price: Number(i.price ?? (i.packs && i.packs[0]?.price) ?? 0),
        image: i.image ?? "",
        qty: i.qty ?? i.quantity ?? 1,
        pack: i.pack ?? (i.packs && i.packs[0]?.pack) ?? 12,
        packs: i.packs ?? undefined,
      }));
      set({ cart: items });
    } catch (err) {
      console.error("switchToGuestCart failed:", err);
      set({ cart: [] });
    }
  },
}));
