import axiosInstance from "./axios";

interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  company?: string;
}

interface SignInData {
  email: string;
  password: string;
}

export const signUpUser = async (data: SignUpData) => {
  const res = await axiosInstance.post("/auth/signup", {
    username: data.fullName,
    email: data.email,
    password: data.password,
    company: data.company,
  });
  return res.data;
};

export const signInUser = async (data: SignInData) => {
  const res = await axiosInstance.post("/auth/login", data);
  return res.data;
};

export const refreshToken = async (refreshToken: string) => {
  const res = await axiosInstance.post("/auth/refresh", { refreshToken });
  return res.data;
};

export const getMe = async (token: string) => {
  const res = await axiosInstance.get("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
