import { Router } from "express";
import * as Controller from "../controllers/source.controller";
const router = Router();

// Runners & Sources
router.get("/", Controller.handleFetchSources);
// Filters & Sorters
router.get("/:sourceId/sorters", Controller.handleFetchSearchSorters);
router.get("/:sourceId/filters", Controller.handleFetchSearchFilters);

// Search
router.post("/:sourceId/search", Controller.handleFetchSearchResults);

// Core
router.get("/:sourceId/content/:contentId", Controller.handleFetchContent);
router.get(
  "/:sourceId/content/:contentId/chapters",
  Controller.handleFetchChapters
);
router.get(
  "/:sourceId/content/:contentId/chapters/:chapterId",
  Controller.handleFetchChapterData
);

export default router;
