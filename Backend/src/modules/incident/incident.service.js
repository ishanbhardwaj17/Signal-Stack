import Incident from "./incident.model.js";
import User from "../auth/user.model.js";
import { emitSocketEvent } from "../../socket/socket.events.js";

import { STATUS_TRANSITIONS, INCIDENT_STATUS } from "./incident.constants.js";

import ApiError from "../../utils/ApiError.js";
import {
    canBeAssignedIncident,
    canCloseIncident,
    canUpdateIncidentStatus,
    normalizeRole,
    ROLES,
} from "../../utils/roles.js";

export const buildIncidentEventPayload = async (
    incidentId
) => {
    return Incident.findById(incidentId)
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email role")
        .populate("timeline.changedBy", "name email");
};

export const buildLiveFeedEvent = (
    type,
    incident,
    meta = {}
) => {
    const message =
        meta.message ||
        `${incident.title} (${incident.severity})`;

    return {
        type,
        timestamp: meta.timestamp || new Date().toISOString(),
        message,
        incident,
        meta: {
            incidentId: incident._id?.toString?.() || null,
            status: incident.status || null,
            severity: incident.severity || null,
            ...meta.meta,
        },
    };
};

export const createIncident = async (
    incidentData,
    userId
) => {
    const createdIncident = await Incident.create({
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

    const incident =
        await buildIncidentEventPayload(
            createdIncident._id
        );

    emitSocketEvent(
        "incident:created",
        incident
    );
    emitSocketEvent(
        "incident:feed",
        buildLiveFeedEvent(
            "CREATED",
            incident,
            {
                message: `New ${incident.severity.toLowerCase()} incident created`,
            }
        )
    );

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

export const deleteIncident = async (incidentId) => {
    const incident = await Incident.findById(incidentId);

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    await incident.deleteOne();

    return;
};

export const assignIncident = async (
    incidentId,
    assignedTo,
    assignedBy
) => {
    const incident = await Incident.findById(incidentId);

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    const engineer = await User.findById(assignedTo);

    if (!engineer) {
        throw new ApiError(404, "Engineer not found");
    }

    if (
        !canBeAssignedIncident(
            engineer.role
        )
    ) {
        throw new ApiError(
            400,
            "Only engineers or senior engineers can be assigned incidents"
        );
    }

    const previousAssignee = incident.assignedTo;

    incident.assignedTo = assignedTo;

    incident.timeline.push({
        action: "INCIDENT_ASSIGNED",

        previous: previousAssignee
            ? previousAssignee.toString()
            : null,

        current: assignedTo,

        changedBy: assignedBy._id,
    });

    await incident.save();

    const payload =
        await buildIncidentEventPayload(
            incidentId
        );

    emitSocketEvent(
        "incident:assigned",
        payload,
        { room: incidentId.toString() }
    );
    emitSocketEvent(
        "incident:feed",
        buildLiveFeedEvent(
            "ASSIGNED",
            payload,
            {
                message: `Incident assigned to ${payload.assignedTo?.name || "an engineer"}`,
            }
        )
    );

    return payload;
};

export const updateIncidentStatus = async (
    incidentId,
    newStatus,
    user
) => {
    const incident = await Incident.findById(incidentId);

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    const userRole = normalizeRole(
        user.role
    );

    if (
        !canUpdateIncidentStatus(
            userRole
        )
    ) {
        throw new ApiError(
            403,
            "Your role cannot update incident statuses"
        );
    }

    if (
        userRole === ROLES.ENGINEER &&
        incident.assignedTo?.toString() !== user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You can only update incidents assigned to you"
        );
    }

    const currentStatus = incident.status;


    const allowedTransitions =
        STATUS_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
        throw new ApiError(
            400,
            `Invalid status transition from ${currentStatus} to ${newStatus}`
        );
    }

    if (
        newStatus === INCIDENT_STATUS.CLOSED &&
        !canCloseIncident(userRole)
    ) {
        throw new ApiError(
            403,
            "Only senior engineers or admins can close incidents"
        );
    }
    
    incident.timeline.push({
        action: "STATUS_CHANGED",

        previous: currentStatus,

        current: newStatus,

        changedBy: user._id,
    });

    incident.status = newStatus;

    if (newStatus === INCIDENT_STATUS.RESOLVED) {
        incident.resolvedAt = new Date();
    }

    if (
        currentStatus === INCIDENT_STATUS.RESOLVED &&
        newStatus !== INCIDENT_STATUS.CLOSED
    ) {
        incident.resolvedAt = null;
    }

    await incident.save();

    const payload =
        await buildIncidentEventPayload(
            incidentId
        );

    emitSocketEvent(
        "incident:statusUpdated",
        payload,
        { room: incidentId.toString() }
    );
    emitSocketEvent(
        "incident:feed",
        buildLiveFeedEvent(
            "STATUS_UPDATED",
            payload,
            {
                message: `Incident moved to ${newStatus}`,
                meta: {
                    previousStatus:
                        currentStatus,
                },
            }
        )
    );

    return payload;
};
