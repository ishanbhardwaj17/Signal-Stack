import express from "express";

import { protect } from "../../middleware/auth.middleware.js";

import {
    getDashboardStatsController,
    getSeverityDistributionController,
    getIncidentTrendsController,
} from "./dashboard.controller.js";

const router = express.Router();

router.get(
    "/stats",
    protect,
    getDashboardStatsController
);

router.get(
    "/severity-distribution",
    protect,
    getSeverityDistributionController
);

router.get(
    "/trends",
    protect,
    getIncidentTrendsController
);

export default router;