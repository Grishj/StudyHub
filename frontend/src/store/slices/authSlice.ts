// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  AuthState,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  AuthApiResponse,
  User,
} from "../../types/auth.types";
import { authService } from "@api/services/auth.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

/* --------------------------- THUNKS --------------------------- */
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const res = await authService.login(credentials);
      return res.data; // { user, accessToken, refreshToken }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const res = await authService.register(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ?? "Registration failed"
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data: ForgotPasswordData, { rejectWithValue }) => {
    try {
      await authService.forgotPassword(data);
      return { email: data.email };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ?? "Failed to send reset email"
      );
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

/** Restore auth from AsyncStorage on app start */
export const checkAuthStatus = createAsyncThunk(
  "auth/checkStatus",
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return null;

      const userJson = await AsyncStorage.getItem("user");
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!userJson) return null;

      const user = JSON.parse(userJson) as User;
      return { user, token, refreshToken };
    } catch {
      return rejectWithValue("Failed to restore auth");
    }
  }
);

/* ----------------------------- SLICE ----------------------------- */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    /* ---------- LOGIN ---------- */
    builder
      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.accessToken;
        s.refreshToken = a.payload.refreshToken;
        s.isAuthenticated = true;
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      });

    /* ---------- REGISTER ---------- */
    builder
      .addCase(register.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(register.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.accessToken;
        s.refreshToken = a.payload.refreshToken;
        s.isAuthenticated = true;
      })
      .addCase(register.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      });

    /* ---------- FORGOT PASSWORD ---------- */
    builder
      .addCase(forgotPassword.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(forgotPassword.fulfilled, (s) => {
        s.loading = false;
        s.error = null;
      })
      .addCase(forgotPassword.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      });

    /* ---------- LOGOUT ---------- */
    builder.addCase(logout.fulfilled, (s) => {
      s.user = null;
      s.token = null;
      s.refreshToken = null;
      s.isAuthenticated = false;
    });

    /* ---------- CHECK AUTH STATUS ---------- */
    builder.addCase(checkAuthStatus.fulfilled, (s, a) => {
      if (a.payload) {
        s.user = a.payload.user;
        s.token = a.payload.token;
        s.refreshToken = a.payload.refreshToken;
        s.isAuthenticated = true;
      }
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
