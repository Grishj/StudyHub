import { Router } from "express";
import { GroupController } from "@/controllers/group.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validation.middleware";
import {
  createGroupValidator,
  updateGroupValidator,
  groupIdValidator,
} from "@/validators/group.validator";
import { contentCreationLimiter } from "@/middleware/rateLimit.middleware";
import { body, param } from "express-validator";

const router = Router();
const groupController = new GroupController();

// Public routes
router.get("/", groupController.getGroups.bind(groupController));

router.get(
  "/:id",
  groupIdValidator,
  validate,
  groupController.getGroupById.bind(groupController)
);

router.get(
  "/:id/members",
  groupIdValidator,
  validate,
  groupController.getGroupMembers.bind(groupController)
);

// Protected routes
router.post(
  "/",
  authenticate,
  contentCreationLimiter, // 30 groups per 15 minutes
  createGroupValidator,
  validate,
  groupController.createGroup.bind(groupController)
);

router.patch(
  "/:id",
  authenticate,
  updateGroupValidator,
  validate,
  groupController.updateGroup.bind(groupController)
);

router.delete(
  "/:id",
  authenticate,
  groupIdValidator,
  validate,
  groupController.deleteGroup.bind(groupController)
);

router.post(
  "/:id/join",
  authenticate,
  groupIdValidator,
  validate,
  groupController.joinGroup.bind(groupController)
);

router.post(
  "/:id/leave",
  authenticate,
  groupIdValidator,
  validate,
  groupController.leaveGroup.bind(groupController)
);

router.patch(
  "/:id/members/:userId/role",
  authenticate,
  param("id").isUUID(),
  param("userId").isUUID(),
  body("role").isIn(["admin", "moderator", "member"]),
  validate,
  groupController.updateMemberRole.bind(groupController)
);

router.delete(
  "/:id/members/:userId",
  authenticate,
  param("id").isUUID(),
  param("userId").isUUID(),
  validate,
  groupController.removeMember.bind(groupController)
);

router.get(
  "/my/groups",
  authenticate,
  groupController.getUserGroups.bind(groupController)
);

export default router;
