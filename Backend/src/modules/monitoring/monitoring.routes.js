import express from 'express';

import {
    createAlertRule,
    deleteAlertRule,
    getAlertRules,
    getMonitoringActivity,
    ingestMetric,
    updateAlertRule,
} from './monitoring.controller.js';
import validate from "../../middleware/validate.middleware.js";
import {
    authorizeRoles,
    authorizeMonitoringIngest,
    protect,
} from "../../middleware/auth.middleware.js";
import {
    alertRuleSchema,
    ingestMetricSchema,
    updateAlertRuleSchema,
} from "./monitoring.validation.js";

const router = express.Router();

router.get(
    '/rules',
    protect,
    getAlertRules
);

router.post(
    '/rules',
    protect,
    authorizeRoles(
        'SENIOR_ENGINEER',
        'ADMIN'
    ),
    validate(alertRuleSchema),
    createAlertRule
);

router.patch(
    '/rules/:ruleId',
    protect,
    authorizeRoles(
        'SENIOR_ENGINEER',
        'ADMIN'
    ),
    validate(updateAlertRuleSchema),
    updateAlertRule
);

router.delete(
    '/rules/:ruleId',
    protect,
    authorizeRoles(
        'SENIOR_ENGINEER',
        'ADMIN'
    ),
    deleteAlertRule
);

router.get(
    '/activity',
    protect,
    getMonitoringActivity
);

router.post(
    '/ingest',
    authorizeMonitoringIngest,
    validate(ingestMetricSchema),
    ingestMetric
);

export default router;
