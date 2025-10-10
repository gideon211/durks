// src/store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "@/api/axios";
import { toast } from "sonner";

export interface Product {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

export interface CartItem extends Product {
  id: string | number; // backend cart item id OR local id like "local-<ts>"
  drinkId: string | number; // original product id
  qty: number;
  _local?: boolean;
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
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      setCart: (items: CartItem[]) => {
        set({ cart: items });
      },

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
        // Always delay 3 seconds before adding, regardless of online or offline
        await new Promise((res) => setTimeout(res, 3000));

        try {
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

          set({ cart: [...get().cart, newItem] });
          toast.success(`${product.name} added to cart`);
        } catch (err) {
          console.warn("Add to cart (server) failed, using local fallback:", err);

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
          toast.success(`${product.name} added to cart`);
        }
      },

      removeFromCart: async (cartItemId: string | number) => {
        try {
          const current = get().cart;
          const item = current.find((i) => i.id === cartItemId);
          if (!item) return;

          // if local item
          if (typeof cartItemId === "string" && String(cartItemId).startsWith("local-")) {
            set({ cart: current.filter((i) => i.id !== cartItemId) });
            // toast.success(`${item.name} removed from cart`);
            return;
          }

          // try server delete
          await axiosInstance.delete(`/cart/${cartItemId}`);
          set({ cart: current.filter((i) => i.id !== cartItemId) });
          // toast.success(`${item.name} removed from cart`);
        } catch (err) {
          console.warn("Remove from cart failed, removing locally:", err);
          set({ cart: get().cart.filter((i) => i.id !== cartItemId) });
          // toast.success("Item removed from cart");
        }
      },

      updateQty: async (cartItemId: string | number, qty: number) => {
        if (qty <= 0) return;
        try {
          if (typeof cartItemId === "string" && String(cartItemId).startsWith("local-")) {
            set({
              cart: get().cart.map((item) =>
                item.id === cartItemId ? { ...item, qty } : item
              ),
            });
            return;
          }

          await axiosInstance.put(`/cart/${cartItemId}`, { quantity: qty });
          set({
            cart: get().cart.map((item) =>
              item.id === cartItemId ? { ...item, qty } : item
            ),
          });
        } catch (err) {
          console.warn("Update quantity failed, updating locally:", err);
          set({
            cart: get().cart.map((item) =>
              item.id === cartItemId ? { ...item, qty } : item
            ),
          });
        }
      },

      clearCart: () => {
        set({ cart: [] });
        // toast.success("Cart cleared");
      },

      totalQty: () => get().cart.reduce((sum, item) => sum + item.qty, 0),

      totalPrice: () =>
        get().cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    }),
    {
      name: "cart-storage",
    }
  )
);