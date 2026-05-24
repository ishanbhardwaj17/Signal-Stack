import express from "express";

import { protect } from "../../middleware/auth.middleware.js";

import { analyzeIncidentController } from "./ai.controller.js";

const router = express.Router();

router.post(
    "/incidents/:id/analyze",
    protect,
    analyzeIncidentController
);

export default router;