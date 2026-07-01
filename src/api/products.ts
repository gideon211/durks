import axiosInstance from "./axios";

export const getProducts = async () => {
  const res = await axiosInstance.get("/drinks");
  return res.data;
};