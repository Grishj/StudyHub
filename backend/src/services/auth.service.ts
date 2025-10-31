import prisma from "@/config/database";
import { RegisterDTO, LoginDTO, AuthResponse } from "@/types/auth.types";
import { hashPassword, comparePassword } from "@/utils/hash.util";
import { generateToken, generateRefreshToken } from "@/utils/jwt.util";
import { sendWelcomeEmail, sendPasswordResetEmail } from "@/utils/email.util";
import crypto from "crypto";

export class AuthService {
  async register(data: RegisterDTO): Promise<AuthResponse> {
    const { fullName, email, password } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        profile: {
          create: {}, // Creates empty profile with default values
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Send welcome email (async, don't wait)
    sendWelcomeEmail(email, fullName).catch((error) =>
      console.error("Failed to send welcome email:", error)
    );

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
      token,
      refreshToken,
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        avatar: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Update refresh token and last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        lastLogin: new Date(),
      },
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
      token,
      refreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save hashed token and expiry (1 hour from now)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Hash the provided token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  }

  async refreshToken(
    oldRefreshToken: string
  ): Promise<{ token: string; refreshToken: string }> {
    // Find user with this refresh token
    const user = await prisma.user.findFirst({
      where: { refreshToken: oldRefreshToken },
    });

    if (!user) {
      throw new Error("Invalid refresh token");
    }

    // Generate new tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { token, refreshToken };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
        bio: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            phone: true,
            dateOfBirth: true,
            address: true,
            targetExam: true,
            points: true,
            streak: true,
            lastActiveDate: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}
