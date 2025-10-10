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
  id: string | number; // backend cart item id
  drinkId: string | number; // product id
  quantity: number;
}

interface CartStore {
  cart: CartItem[];
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (cartItemId: string | number) => Promise<void>;
  clearCart: () => Promise<void>;
  setCart: (items: CartItem[]) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      isOnline: navigator.onLine,

      setIsOnline: (status) => set({ isOnline: status }),

      setCart: (items) => set({ cart: items }),

      addToCart: async (product) => {
        const { isOnline, cart } = get();

        // Small delay before adding
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Update UI instantly
        const existingItem = cart.find((item) => item.drinkId === product.id);

        if (existingItem) {
          const updatedCart = cart.map((item) =>
            item.drinkId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          set({ cart: updatedCart });
        } else {
          const newItem = {
            id: Date.now(),
            drinkId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: 1,
          };
          set({ cart: [...cart, newItem] });
        }

        toast.success(`${product.name} added to cart`);

        // Backend sync happens in background
        if (isOnline) {
          axiosInstance
            .post("/cart", { drinkId: product.id, quantity: 1 })
            .catch((error) => console.error("Cart sync failed:", error));
        }
      },

      removeFromCart: async (cartItemId) => {
        const { isOnline, cart } = get();

        await new Promise((resolve) => setTimeout(resolve, 500));

        set({
          cart: cart.filter((item) => item.id !== cartItemId),
        });

        // toast.success("Item removed from cart");

        if (isOnline) {
          axiosInstance
            .delete(`/cart/${cartItemId}`)
            .catch((error) => console.error("Error removing:", error));
        }
      },

      clearCart: async () => {
        const { isOnline } = get();

        await new Promise((resolve) => setTimeout(resolve, 500));

        set({ cart: [] });

        if (isOnline) {
          axiosInstance
            .delete("/cart/clear")
            .catch((error) => console.error("Error clearing:", error));
        }
      },
    }),
    {
      name: "cart-storage",
    }
  )
);