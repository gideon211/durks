import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCartItems, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart } from "@/api/cartApi";

interface CartItem {
  id: string;
  quantity: number;
  Drink: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (drinkId: string, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const refreshCart = async () => {
    const items = await getCartItems();
    setCart(items);
  };

  const addToCart = async (drinkId: string, quantity: number = 1) => {
    const item = await apiAddToCart(drinkId, quantity);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => (i.id === item.id ? item : i));
      return [...prev, item];
    });
  };

  const removeFromCart = async (cartItemId: string) => {
    await apiRemoveFromCart(cartItemId);
    setCart((prev) => prev.filter((i) => i.id !== cartItemId));
  };

//   useEffect(() => {
//     refreshCart();
//   }, []);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
