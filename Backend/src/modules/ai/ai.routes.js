import express from "express";

import { protect } from "../../middleware/auth.middleware.js";

import { analyzeIncidentController, generateIncidentSummaryController } from "./ai.controller.js";

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

export default router;