import { Request, Response, NextFunction } from "express";
import { AuthService } from "@/services/auth.service";
import { sendSuccess, sendError } from "@/utils/response.util";
//import "@/types/express"; // Add this line

const authService = new AuthService();

export class AuthController {
  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, "Registration successful", result, 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, "Login successful", result);
    } catch (error: any) {
      sendError(res, error.message, 401);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logout(req.user!.id);
      sendSuccess(res, "Logout successful");
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // This method does NOT throw if user is not found (by design)
      await authService.forgotPassword(req.body.email);

      // Always respond with success to prevent user enumeration
      sendSuccess(
        res,
        "If your email is registered, a reset link has been sent."
      );
    } catch (error: any) {
      // Only catches real errors (e.g., email service down, DB issue)
      console.error("Forgot password error:", error);
      sendError(res, "Unable to process request at this time", 500);
    }
  }
  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      sendSuccess(res, "Password reset successful");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.refreshToken(req.body.refreshToken);
      sendSuccess(res, "Token refreshed successfully", result);
    } catch (error: any) {
      sendError(res, error.message, 401);
    }
  }

  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const profile = await authService.getProfile(req.user!.id);
      sendSuccess(res, "Profile retrieved successfully", profile);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }
}
