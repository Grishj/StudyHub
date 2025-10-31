import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/utils/jwt.util";
import { sendError } from "@/utils/response.util";
import prisma from "@/config/database";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "No token provided", 401);
      return;
    }

    const token = authHeader.substring(7);

    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        bio: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      sendError(res, "User not found", 401);
      return;
    }

    // Now TypeScript knows the exact shape of user matches req.user
    req.user = user;
    next();
  } catch (error) {
    sendError(res, "Invalid or expired token", 401);
  }
};
