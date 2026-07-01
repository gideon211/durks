// src/api/orders.ts
import axiosInstance from "./axios"; 

export const fetchUserOrders = async () => {
  const res = await axiosInstance.get("/orders/user"); 
  return res.data.orders;
};
