// src/api/axios.config.ts
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import { safeMultiSet, safeMultiRemove } from "@utils/storage"; // 👈 Add safeMultiRemove here

class ApiClient {
  private instance: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: API_URL,
      timeout: 15_000,
      headers: { "Content-Type": "application/json" },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request: Add Bearer token
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem("accessToken");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    // Response: 401 → refresh → retry
    this.instance.interceptors.response.use(
      (res) => res,
      async (error: AxiosError) => {
        const originalReq = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalReq._retry) {
          originalReq._retry = true;

          try {
            const newAccessToken = await this.refreshToken();
            originalReq.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.instance(originalReq);
          } catch (refreshErr) {
            await this.logout();
            return Promise.reject(refreshErr);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<string> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token stored");

        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = data.data;

        const pairs: [string, string][] = [["accessToken", accessToken]];
        if (newRefreshToken) {
          pairs.push(["refreshToken", newRefreshToken]);
        }

        await safeMultiSet(pairs);

        return accessToken;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async logout() {
    await safeMultiRemove(["accessToken", "refreshToken", "user"]);
  }

  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

export const api = new ApiClient().getInstance();
