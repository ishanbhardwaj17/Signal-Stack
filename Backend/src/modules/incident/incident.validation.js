import { z } from "zod";

import {
    INCIDENT_SEVERITY,
} from "./incident.constants.js";

export const createIncidentSchema = z.object({
    title: z.string().min(5),

    description: z.string().min(10),

    category: z.string().min(3),

    severity: z.enum([
        INCIDENT_SEVERITY.LOW,
        INCIDENT_SEVERITY.MEDIUM,
        INCIDENT_SEVERITY.HIGH,
        INCIDENT_SEVERITY.CRITICAL,
    ]),
});