import Incident from "./incident.model.js";
import User from "../auth/user.model.js";
import { getIO } from "../../socket/socket.server.js";

import { STATUS_TRANSITIONS, INCIDENT_STATUS, INCIDENT_SEVERITY } from "./incident.constants.js";

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
    adminId
) => {
    const incident = await Incident.findById(incidentId);

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    const engineer = await User.findById(assignedTo);

    if (!engineer) {
        throw new ApiError(404, "Engineer not found");
    }

    if (engineer.role !== "engineer") {
        throw new ApiError(
            400,
            "Only engineers can be assigned incidents"
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

        changedBy: adminId,
    });

    await incident.save();

    const io = getIO();

    io.to(incidentId.toString()).emit(
        "incident:assigned",
        incident
    );

    return incident;
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

    if (
        user.role === "engineer" &&
        incident.assignedTo?.toString() !== user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You can only update incidents assigned to you"
        );
    }

    const currentStatus = incident.status;


    if (user.role !== "admin") {
        const allowedTransitions =
            STATUS_TRANSITIONS[currentStatus];

        if (!allowedTransitions.includes(newStatus)) {
            throw new ApiError(
                400,
                `Invalid status transition from ${currentStatus} to ${newStatus}`
            );
        }
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

    const io = getIO();

    io.to(incidentId.toString()).emit(
        "incident:statusUpdated",
        incident
    );

    return incident;
};