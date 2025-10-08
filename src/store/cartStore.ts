import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "@/api/axios"; // your axios.ts
import { toast } from "sonner";

export interface Product {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

export interface CartItem extends Product {
  id: string | number; // backend cart item id
  drinkId: string | number; // original product id
  qty: number;
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
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

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
        try {
          const res = await axiosInstance.post("/cart", { drinkId: product.id, quantity: qty });
          const item = res.data.cartItem;
          set({
            cart: [...get().cart, {
              id: item.id,
              drinkId: item.drinkId,
              name: item.Drink.name,
              price: item.Drink.price,
              image: item.Drink.image,
              qty: item.quantity,
            }],
          });
          toast.success(`${product.name} added to cart`);
        } catch (err) {
          console.error("Add to cart failed:", err);
          toast.error("Failed to add to cart");
        }
      },

      removeFromCart: async (cartItemId: string | number) => {
        try {
          await axiosInstance.delete(`/cart/${cartItemId}`);
          set({ cart: get().cart.filter((item) => item.id !== cartItemId) });
          toast.success("Item removed from cart");
        } catch (err) {
          console.error("Remove from cart failed:", err);
          toast.error("Failed to remove item");
        }
      },

      updateQty: async (cartItemId: string | number, qty: number) => {
        if (qty <= 0) return;
        try {
          await axiosInstance.put(`/cart/${cartItemId}`, { quantity: qty });
          set({
            cart: get().cart.map((item) =>
              item.id === cartItemId ? { ...item, qty } : item
            ),
          });
        } catch (err) {
          console.error("Update quantity failed:", err);
          toast.error("Failed to update quantity");
        }
      },

      clearCart: () => {
        set({ cart: [] });
        toast.success("Cart cleared");
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
