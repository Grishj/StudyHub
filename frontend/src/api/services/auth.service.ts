// src/api/services/auth.service.ts
import { api } from "../axios.config";
import { safeMultiSet, safeMultiRemove } from "@utils/storage";
import {
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  User,
  AuthApiResponse,
} from "../../types/auth.types";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

class AuthService {
  /* ---------------------- LOGIN / REGISTER ---------------------- */
  async login(credentials: LoginCredentials): Promise<AuthApiResponse> {
    try {
      const res = await api.post<AuthApiResponse>("/auth/login", credentials);

      // Validate response structure
      if (!res.data || !res.data.data) {
        throw new Error("Invalid response structure from server");
      }

      // Only save if we have valid data
      if (res.data.data.accessToken) {
        await this.saveAuthData(res.data.data);
      } else {
        console.warn("Login successful but no access token received");
      }

      return res.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthApiResponse> {
    try {
      const res = await api.post<AuthApiResponse>("/auth/register", data);

      // Validate response structure
      if (!res.data || !res.data.data) {
        throw new Error("Invalid response structure from server");
      }

      // Check if this is a registration that requires email verification
      // (no tokens returned immediately)
      if (!res.data.data.accessToken) {
        console.log(
          "Registration successful - email verification may be required"
        );
        // Return the response without saving auth data
        return res.data;
      }

      // Save auth data if tokens are provided
      await this.saveAuthData(res.data.data);
      return res.data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }

  /* -------------------------- LOGOUT -------------------------- */
  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("Logout API call failed, clearing local data anyway");
    } finally {
      await this.clearAuthData();
    }
  }

  /* --------------------- PASSWORD RESET --------------------- */
  async forgotPassword(
    data: ForgotPasswordData
  ): Promise<ForgotPasswordResponse> {
    const res = await api.post<ForgotPasswordResponse>(
      "/auth/forgot-password",
      data
    );
    return res.data;
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post("/auth/reset-password", { token, password });
  }

  /* -------------------------- PROFILE -------------------------- */
  async getProfile(): Promise<User> {
    const { data } = await api.get<{ data: User }>("/auth/profile");
    return data.data;
  }

  /* ----------------------- STORAGE HELPERS --------------------- */
  private async saveAuthData(data: {
    user?: User | null;
    accessToken?: string | null;
    refreshToken?: string | null;
  }): Promise<void> {
    // Build array of valid key-value pairs, filtering out null/undefined values
    const pairs: [string, string][] = [];

    // Only add accessToken if it exists and is a string
    if (data.accessToken && typeof data.accessToken === "string") {
      pairs.push(["accessToken", data.accessToken]);
    }

    // Only add refreshToken if it exists and is a string
    if (data.refreshToken && typeof data.refreshToken === "string") {
      pairs.push(["refreshToken", data.refreshToken]);
    }

    // Only add user if it exists
    if (data.user && typeof data.user === "object") {
      try {
        const userJson = JSON.stringify(data.user);
        pairs.push(["user", userJson]);
      } catch (error) {
        console.error("Failed to stringify user object:", error);
      }
    }

    // Only call multiSet if we have valid pairs to save
    if (pairs.length > 0) {
      await safeMultiSet(pairs);
      console.log(`Saved ${pairs.length} auth items to storage`);
    } else {
      console.warn("No valid auth data to save");
    }
  }

  private async clearAuthData(): Promise<void> {
    await safeMultiRemove(["accessToken", "refreshToken", "user"]);
  }

  /* ------------------- QUICK RE‑HYDRATION ------------------- */
  async getStoredUser(): Promise<User | null> {
    try {
      const raw = await AsyncStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      return !!token;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
