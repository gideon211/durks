// src/store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

// Axios instance with 3s timeout
const axiosInstance = axios.create({
  baseURL: "https://your-backend-url", // replace with your backend URL
  timeout: 3000, // 3 seconds timeout
});

export interface Product {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

export interface CartItem extends Product {
  id: string | number; // backend cart id OR local id like "local-<timestamp>"
  drinkId: string | number; // original product id
  qty: number;
  _local?: boolean; // true if offline-only
}

interface CartState {
  cart: CartItem[];
  fetchCart: () => Promise<void>;
  addToCart: (product: Product, qty?: number) => Promise<void>;
  removeFromCart: (cartItemId: string | number) => Promise<void>;
  updateQty: (cartItemId: string | number, qty: number) => Promise<void>;
  clearCart: () => void;
  totalQty: () => number;
  totalPrice: () => number;
  setCart: (items: CartItem[]) => void;
  syncLocalItems: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      setCart: (items: CartItem[]) => set({ cart: items }),

      fetchCart: async () => {
        try {
          const res = await axiosInstance.get("/cart");
          const items: CartItem[] = res.data.cartItems.map((item: any) => ({
            id: item.id,
            drinkId: item.drinkId,
            name: item.Drink.name,
            price: item.Drink.price,
            image: item.Drink.image,
            qty: item.quantity,
          }));
          set({ cart: items });
        } catch (err) {
          console.error("Fetch cart failed:", err);
        }
      },

      addToCart: async (product: Product, qty = 1) => {
        const existingItem = get().cart.find(i => i.drinkId === product.id);

        const createLocalItem = () => {
          if (existingItem) {
            // increase quantity if exists locally
            set({
              cart: get().cart.map(item =>
                item.drinkId === product.id
                  ? { ...item, qty: item.qty + qty }
                  : item
              ),
            });
          } else {
            const localItem: CartItem = {
              id: `local-${Date.now()}`,
              drinkId: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              qty,
              _local: true,
            };
            set({ cart: [...get().cart, localItem] });
          }
        };

        if (!navigator.onLine) {
          createLocalItem();
          return;
        }

        try {
          if (existingItem && !existingItem._local) {
            // update quantity if exists on backend
            await axiosInstance.put(`/cart/${existingItem.id}`, {
              quantity: existingItem.qty + qty,
            });
            set({
              cart: get().cart.map(item =>
                item.drinkId === product.id
                  ? { ...item, qty: item.qty + qty }
                  : item
              ),
            });
          } else {
            const res = await axiosInstance.post("/cart", {
              drinkId: product.id,
              quantity: qty,
            });

            const item = res.data.cartItem;
            const newItem: CartItem = {
              id: item.id,
              drinkId: item.drinkId,
              name: item.Drink.name,
              price: item.Drink.price,
              image: item.Drink.image,
              qty: item.quantity,
            };

            set({
              cart: existingItem
                ? get().cart.map(i =>
                    i.drinkId === product.id ? { ...i, qty: i.qty + qty } : i
                  )
                : [...get().cart, newItem],
            });
          }
        } catch (err) {
          console.warn("Add to cart failed, using local fallback:", err);
          createLocalItem();
        }
      },

      removeFromCart: async (cartItemId: string | number) => {
        const current = get().cart;
        const item = current.find((i) => i.id === cartItemId);
        if (!item) return;

        if (typeof cartItemId === "string" && cartItemId.startsWith("local-")) {
          set({ cart: current.filter((i) => i.id !== cartItemId) });
          return;
        }

        try {
          await axiosInstance.delete(`/cart/${cartItemId}`);
          set({ cart: current.filter((i) => i.id !== cartItemId) });
        } catch (err) {
          console.warn("Remove failed, removing locally:", err);
          set({ cart: current.filter((i) => i.id !== cartItemId) });
        }
      },

      updateQty: async (cartItemId: string | number, qty: number) => {
        if (qty <= 0) return;

        const updateLocal = () => {
          set({
            cart: get().cart.map((item) =>
              item.id === cartItemId ? { ...item, qty } : item
            ),
          });
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
      },

      totalQty: () =>
        get().cart.reduce((sum, item) => sum + item.qty, 0),

      totalPrice: () =>
        get().cart.reduce((sum, item) => sum + item.price * item.qty, 0),

      syncLocalItems: async () => {
        const localItems = get().cart.filter((i) => i._local);
        if (localItems.length === 0) return;

        try {
          for (const item of localItems) {
            const res = await axiosInstance.post("/cart", {
              drinkId: item.drinkId,
              quantity: item.qty,
            });

            const saved = res.data.cartItem;
            const syncedItem: CartItem = {
              id: saved.id,
              drinkId: saved.drinkId,
              name: saved.Drink.name,
              price: saved.Drink.price,
              image: saved.Drink.image,
              qty: saved.quantity,
            };

            set({
              cart: get().cart.map((i) =>
                i.id === item.id ? syncedItem : i
              ),
            });
          }
        } catch (err) {
          console.warn("Failed to sync offline cart:", err);
        }
      },
    }),
    {
      name: "cart-storage",
    }
  )
);

// Automatically sync when user comes back online
if (typeof window !== "undefined") {
  window.addEventListener("online", async () => {
    const store = useCartStore.getState();
    await store.syncLocalItems();
  });
}