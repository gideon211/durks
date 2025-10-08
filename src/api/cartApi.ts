import axiosInstance from "./axios"; 

export const addToCart = async (drinkId: string, quantity: number = 1) => {
  const res = await axiosInstance.post("/cart", { drinkId, quantity });
  return res.data.cartItem;
};

export const getCartItems = async () => {
  const res = await axiosInstance.get("/cart");
  return res.data.cartItems;
};

export const removeFromCart = async (cartItemId: string) => {
  const res = await axiosInstance.delete(`/cart/${cartItemId}`);
  return res.data;
};
