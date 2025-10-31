import axiosInstance from "../axios.config";
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ForgotPasswordData,
} from "../../types/auth.types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/login", credentials);
    if (response.data.token) {
      await AsyncStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/register", data);
    if (response.data.token) {
      await AsyncStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem("token");
    await axiosInstance.post("/auth/logout");
  },

  forgotPassword: async (
    data: ForgotPasswordData
  ): Promise<{ message: string }> => {
    const response = await axiosInstance.post("/auth/forgot-password", data);
    return response.data;
  },
};
