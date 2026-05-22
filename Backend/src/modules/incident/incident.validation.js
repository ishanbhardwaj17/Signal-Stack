import { z } from "zod";
import { INCIDENT_STATUS } from "./incident.constants.js";

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

export const assignIncidentSchema = z.object({
    assignedTo: z.string().min(1, "Engineer ID is required"),
});

export const updateStatusSchema = z.object({
    status: z.enum([
        INCIDENT_STATUS.OPEN,
        INCIDENT_STATUS.TRIAGED,
        INCIDENT_STATUS.IN_PROGRESS,
        INCIDENT_STATUS.MONITORING,
        INCIDENT_STATUS.RESOLVED,
        INCIDENT_STATUS.CLOSED,
    ]),
});