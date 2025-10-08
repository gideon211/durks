import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://v67p2qfl-5000.uks1.devtunnels.ms/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Attach token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const { token } = JSON.parse(stored);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized (token expired)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
