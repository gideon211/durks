import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

export interface CartItem extends Product {
  qty: number;
}

interface CartState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string | number) => void;
  updateQty: (id: string | number, qty: number) => void;
  clearCart: () => void;
  totalQty: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product) => {
        const cart = get().cart;
        const existing = cart.find((item) => item.id === product.id);

        if (existing) {
          set({
            cart: cart.map((item) =>
              item.id === product.id ? { ...item, qty: item.qty + 1 } : item
            ),
          });
        } else {
          set({
            cart: [...cart, { ...product, qty: 1 }],
          });
        }
      },

      removeFromCart: (id) => {
        set({ cart: get().cart.filter((item) => item.id !== id) });
      },

      updateQty: (id, qty) => {
        if (qty <= 0) return;
        set({
          cart: get().cart.map((item) =>
            item.id === id ? { ...item, qty } : item
          ),
        });
      },

      clearCart: () => {
        set({ cart: [] });
      },

      totalQty: () => get().cart.reduce((sum, item) => sum + item.qty, 0),

      totalPrice: () =>
        get().cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    }),
    {
      name: "cart-storage", // name in localStorage
    }
  )
);
