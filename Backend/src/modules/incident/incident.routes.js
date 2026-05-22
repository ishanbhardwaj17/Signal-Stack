import express from "express";

import {
    createIncidentController,
    getAllIncidentsController,
    getIncidentByIdController,
    deleteIncidentController,
    assignIncidentController,
    updateIncidentStatusController,
} from "./incident.controller.js";

import validate from "../../middleware/validate.middleware.js";

import { protect } from "../../middleware/auth.middleware.js";

import { authorizeRoles } from "../../middleware/auth.middleware.js";

import {
  createIncidentSchema,
  assignIncidentSchema,
  updateStatusSchema,
} from "./incident.validation.js";

const router = express.Router();

router.post(
    "/",
    protect,
    validate(createIncidentSchema),
    createIncidentController
);

router.get(
    "/",
    protect,
    getAllIncidentsController
);

router.get(
    "/:id",
    protect,
    getIncidentByIdController
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteIncidentController
);

router.patch(
  "/:id/assign",
  protect,
  authorizeRoles("admin"),
  validate(assignIncidentSchema),
  assignIncidentController
);

router.patch(
  "/:id/status",
  protect,
  validate(updateStatusSchema),
  updateIncidentStatusController
);

export default router;