import { Request, Response, NextFunction } from "express";
import { ProfileService } from "@/services/profile.service";
import { sendSuccess, sendError } from "@/utils/response.util";

const profileService = new ProfileService();

export class ProfileController {
  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const profile = await profileService.getProfile(req.user!.id);
      sendSuccess(res, "Profile retrieved successfully", profile);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async getProfileById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const profile = await profileService.getPublicProfile(req.params.id);
      sendSuccess(res, "Profile retrieved successfully", profile);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const profile = await profileService.updateProfile(
        req.user!.id,
        req.body
      );
      sendSuccess(res, "Profile updated successfully", profile);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateAvatar(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const profile = await profileService.updateAvatar(
        req.user!.id,
        req.body.avatar
      );
      sendSuccess(res, "Avatar updated successfully", profile);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getUserStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await profileService.getUserStats(req.user!.id);
      sendSuccess(res, "User statistics retrieved successfully", stats);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getAchievements(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const achievements = await profileService.getAchievements(req.user!.id);
      sendSuccess(res, "Achievements retrieved successfully", achievements);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getUserProgress(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const progress = await profileService.getUserProgress(req.user!.id);
      sendSuccess(res, "User progress retrieved successfully", progress);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateProgress(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const progress = await profileService.updateProgress(
        req.user!.id,
        req.body.topic,
        req.body.progress
      );
      sendSuccess(res, "Progress updated successfully", progress);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getUserContent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const type = req.query.type as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const content = await profileService.getUserContent(
        req.user!.id,
        type,
        page,
        limit
      );
      sendSuccess(res, "User content retrieved successfully", content);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getBookmarks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const type = req.query.type as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const bookmarks = await profileService.getBookmarks(
        req.user!.id,
        type,
        page,
        limit
      );
      sendSuccess(res, "Bookmarks retrieved successfully", bookmarks);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteAccount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await profileService.deleteAccount(req.user!.id, req.body.password);
      sendSuccess(res, "Account deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async changePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await profileService.changePassword(
        req.user!.id,
        req.body.currentPassword,
        req.body.newPassword
      );
      sendSuccess(res, "Password changed successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateSettings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const settings = await profileService.updateSettings(
        req.user!.id,
        req.body
      );
      sendSuccess(res, "Settings updated successfully", settings);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
