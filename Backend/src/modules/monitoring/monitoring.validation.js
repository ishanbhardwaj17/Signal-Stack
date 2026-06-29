import { z } from "zod";

export const ingestMetricSchema =
    z.object({
        service: z
            .string()
            .trim()
            .min(1, "Service is required"),
        metricType: z.enum([
            "cpu",
            "memory",
            "latency",
            "errors",
        ]),
        value: z.coerce.number(),
        timestamp: z
            .coerce.date()
            .optional(),
    });
