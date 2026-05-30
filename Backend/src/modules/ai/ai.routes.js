import express from "express";

import { protect } from "../../middleware/auth.middleware.js";

import { analyzeIncidentController, generateIncidentSummaryController, generateStructuredAnalysisController, generatePlaybookController } from "./ai.controller.js";

const router = express.Router();

router.post(
  "/incidents/:id/analyze",
  protect,
  analyzeIncidentController
);

router.post(
  '/incidents/:id/generate-summary',
  protect,
  generateIncidentSummaryController
);

router.post(
  '/incidents/:id/analyze-structured',
  protect,
  generateStructuredAnalysisController
);

router.post(
  "/incidents/:id/generate-playbook",
  protect,
  generatePlaybookController
);

export default router;