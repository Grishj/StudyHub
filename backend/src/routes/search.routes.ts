import { Router } from "express";
import { SearchController } from "@/controllers/search.controller";
import { searchLimiter } from "@/middleware/rateLimit.middleware";

const router = Router();
const searchController = new SearchController();

// All search routes have rate limiting - 20 searches per minute
router.get(
  "/",
  searchLimiter,
  searchController.globalSearch.bind(searchController)
);

router.get(
  "/notes",
  searchLimiter,
  searchController.searchNotes.bind(searchController)
);

router.get(
  "/questions",
  searchLimiter,
  searchController.searchQuestions.bind(searchController)
);

router.get(
  "/quizzes",
  searchLimiter,
  searchController.searchQuizzes.bind(searchController)
);

router.get(
  "/groups",
  searchLimiter,
  searchController.searchGroups.bind(searchController)
);

router.get(
  "/users",
  searchLimiter,
  searchController.searchUsers.bind(searchController)
);

export default router;
