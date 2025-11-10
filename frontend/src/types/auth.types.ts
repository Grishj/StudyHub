// src/types/auth.types.ts
export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

/* ---------- FORM PAYLOADS ---------- */
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

/* ---------- API RESPONSE ---------- */
export interface AuthApiResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

/* ---------- REDUX STATE ---------- */
export interface AuthState {
  user: User | null;
  token: string | null; // <-- matches `accessToken` from API
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
