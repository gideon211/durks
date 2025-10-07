import axiosInstance from "./axios";

interface SignInData {
  email: string;
  password: string;
}

interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  company?: string;
}

export const signInUser = async (data: SignInData) => {
  const res = await axiosInstance.post("/auth/signin", data);
  return res.data; 
};

export const signUpUser = async (data: SignUpData) => {
  const res = await axiosInstance.post("/auth/signup", data);
  return res.data;
};
