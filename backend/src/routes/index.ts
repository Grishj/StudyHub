import { Router } from "express";
import authRoutes from "./auth.routes";
import profileRoutes from "./profile.routes";
import categoryRoutes from "./category.routes";
import syllabusRoutes from "./syllabus.routes";
import noteRoutes from "./note.routes";
import questionRoutes from "./question.routes";
import quizRoutes from "./quiz.routes";
import groupRoutes from "./group.routes";
import groupChatRoutes from "./groupChat.routes"; // NEW
import notificationRoutes from "./notification.routes";
import bookmarkRoutes from "./bookmark.routes";
import reportRoutes from "./report.routes";
import uploadRoutes from "./upload.routes";
import searchRoutes from "./search.routes";
import downloadRoutes from "./download.routes";
import statisticsRoutes from "./statistics.routes";

const router = Router();

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API Routes
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/categories", categoryRoutes);
router.use("/syllabus", syllabusRoutes);
router.use("/notes", noteRoutes);
router.use("/questions", questionRoutes);
router.use("/quizzes", quizRoutes);
router.use("/groups", groupRoutes);
router.use("/groups/chat", groupChatRoutes); // NEW - Group chat routes
router.use("/notifications", notificationRoutes);
router.use("/bookmarks", bookmarkRoutes);
router.use("/reports", reportRoutes);
router.use("/upload", uploadRoutes);
router.use("/search", searchRoutes);
router.use("/download", downloadRoutes);
router.use("/statistics", statisticsRoutes);

export default router;
