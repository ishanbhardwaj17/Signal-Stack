import { z } from "zod";
import {
    ALERT_OPERATORS,
    ALERT_SEVERITIES,
    METRIC_TYPES,
} from "./monitoring.constants.js";

export const ingestMetricSchema =
    z.object({
        service: z
            .string()
            .trim()
            .min(1, "Service is required"),
        metricType: z.enum(METRIC_TYPES),
        value: z.coerce.number(),
        timestamp: z
            .coerce.date()
            .optional(),
    });

export const alertRuleSchema =
    z.object({
        service: z
            .string()
            .trim()
            .min(1, "Service is required"),
        metricType: z.enum(METRIC_TYPES),
        operator: z.enum(ALERT_OPERATORS),
        threshold: z.coerce.number(),
        severity: z.enum(ALERT_SEVERITIES),
        isActive: z.boolean().optional(),
    });

export const updateAlertRuleSchema =
    alertRuleSchema.partial().refine(
        (value) =>
            Object.keys(value).length > 0,
        {
            message:
                "At least one rule field must be provided",
        }
    );
