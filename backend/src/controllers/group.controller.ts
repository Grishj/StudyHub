import { Request, Response, NextFunction } from "express";
import { GroupService } from "@/services/group.service";
import { sendSuccess, sendError } from "@/utils/response.util";

const groupService = new GroupService();

export class GroupController {
  async createGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const group = await groupService.createGroup(req.user!.id, req.body);
      sendSuccess(res, "Group created successfully", group, 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getGroups(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = {
        type: req.query.type as string,
        category: req.query.category as string,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const groups = await groupService.getGroups(filters, req.user?.id);
      sendSuccess(res, "Groups retrieved successfully", groups);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getGroupById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const group = await groupService.getGroupById(
        req.params.id,
        req.user?.id
      );
      sendSuccess(res, "Group retrieved successfully", group);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async updateGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const group = await groupService.updateGroup(
        req.params.id,
        req.user!.id,
        req.body
      );
      sendSuccess(res, "Group updated successfully", group);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await groupService.deleteGroup(req.params.id, req.user!.id);
      sendSuccess(res, "Group deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async joinGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const member = await groupService.joinGroup(req.params.id, req.user!.id);
      sendSuccess(res, "Successfully joined the group", member);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async leaveGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await groupService.leaveGroup(req.params.id, req.user!.id);
      sendSuccess(res, "Successfully left the group");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateMemberRole(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const member = await groupService.updateMemberRole(
        req.params.id,
        req.user!.id,
        req.params.userId,
        req.body.role
      );
      sendSuccess(res, "Member role updated successfully", member);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async removeMember(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await groupService.removeMember(
        req.params.id,
        req.user!.id,
        req.params.userId
      );
      sendSuccess(res, "Member removed successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getUserGroups(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const groups = await groupService.getUserGroups(
        req.user!.id,
        page,
        limit
      );
      sendSuccess(res, "User groups retrieved successfully", groups);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getGroupMembers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const members = await groupService.getGroupMembers(
        req.params.id,
        page,
        limit
      );
      sendSuccess(res, "Group members retrieved successfully", members);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
