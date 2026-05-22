import Incident from "./incident.model.js";

import {
    INCIDENT_STATUS,
} from "./incident.constants.js";

import ApiError from "../../utils/ApiError.js";

export const createIncident = async (
    incidentData,
    userId
) => {
    const incident = await Incident.create({
        ...incidentData,

        createdBy: userId,

        timeline: [
            {
                action: "INCIDENT_CREATED",
                current: INCIDENT_STATUS.OPEN,
                changedBy: userId,
            },
        ],
    });

    return incident;
};

export const getAllIncidents = async (filters) => {
    const query = {};

    if (filters.status) {
        query.status = filters.status;
    }

    if (filters.severity) {
        query.severity = filters.severity;
    }

    if (filters.category) {
        query.category = filters.category;
    }

    const incidents = await Incident.find(query)
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email role")
        .sort({ createdAt: -1 });

    return incidents;
};

export const getIncidentById = async (incidentId) => {
    const incident = await Incident.findById(incidentId)
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email role")
        .populate("timeline.changedBy", "name email");

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    return incident;
};