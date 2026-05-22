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

    // Filtering
    if (filters.status) {
        query.status = filters.status;
    }

    if (filters.severity) {
        query.severity = filters.severity;
    }

    if (filters.category) {
        query.category = filters.category;
    }

    if (filters.assignedTo) {
        query.assignedTo = filters.assignedTo;
    }

    if (filters.startDate || filters.endDate) {
        query.createdAt = {};

        if (filters.startDate) {
            query.createdAt.$gte = new Date(filters.startDate);
        }

        if (filters.endDate) {
            query.createdAt.$lte = new Date(filters.endDate);
        }
    }

    if (filters.search) {
        query.$or = [
            {
                title: {
                    $regex: filters.search,
                    $options: "i",
                },
            },
            {
                description: {
                    $regex: filters.search,
                    $options: "i",
                },
            },
        ];
    }

    // Pagination
    const page = Number(filters.page) || 1;

    const limit = Number(filters.limit) || 10;

    const skip = (page - 1) * limit;

    // Total count
    const total = await Incident.countDocuments(query);

    // Data
    const incidents = await Incident.find(query)
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        incidents,
    };
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