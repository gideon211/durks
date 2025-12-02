import axios from "axios";

const API_URL = "https://updated-duks-backend-1-0.onrender.com/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const raw = localStorage.getItem("user");
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// never force logout inside axios
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
