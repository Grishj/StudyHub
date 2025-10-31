import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env"; // ✅ Importing from environment variables

const axiosInstance = axios.create({
  baseURL: API_URL, // ✅ now dynamic from environment
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("token");
      // Optionally navigate to login screen here
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
