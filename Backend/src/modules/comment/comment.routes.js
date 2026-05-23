import express from "express";

import {
    addCommentController,
    getIncidentCommentsController,
} from "./comment.controller.js";

import validate from "../../middleware/validate.middleware.js";

import { protect } from "../../middleware/auth.middleware.js";

import {
    addCommentSchema,
} from "./comment.validation.js";

const router = express.Router();

router.post(
    "/:incidentId",
    protect,
    validate(addCommentSchema),
    addCommentController
);

router.get(
    "/:incidentId",
    protect,
    getIncidentCommentsController
);

export default router;