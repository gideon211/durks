import axios from "axios";

const API_URL = "http://localhost:5000/api"; // replace with your backend

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Attach token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: handle 401 Unauthorized (token expired)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user"); // clear expired token
      window.location.href = "/auth"; // redirect to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
