// api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Add a request interceptor to dynamically set the Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
