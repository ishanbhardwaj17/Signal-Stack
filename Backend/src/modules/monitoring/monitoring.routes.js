import express from 'express';

import {
    ingestMetric,
} from './monitoring.controller.js';
import validate from "../../middleware/validate.middleware.js";
import {
    authorizeMonitoringIngest,
} from "../../middleware/auth.middleware.js";
import {
    ingestMetricSchema,
} from "./monitoring.validation.js";

const router = express.Router();

router.post(
    '/ingest',
    authorizeMonitoringIngest,
    validate(ingestMetricSchema),
    ingestMetric
);

export default router;
