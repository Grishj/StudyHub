// Define the authenticated user type
export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  avatar: string | null;
  bio: string | null;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export interface RegisterDTO {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
    avatar: string | null; // Changed from avatar?: string
    bio: string | null; // Changed from bio?: string
    createdAt: Date;
  };
  token: string;
  refreshToken: string;
}

// This empty export is crucial for the global declaration to work
export {};
