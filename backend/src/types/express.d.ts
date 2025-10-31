declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        fullName: string;
        avatar: string | null;
        bio: string | null;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
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
    avatar?: string;
    bio?: string;
    createdAt: Date;
  };
  token: string;
  refreshToken: string;
}
