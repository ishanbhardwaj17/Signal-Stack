import mongoose from "mongoose";

import {
    INCIDENT_SEVERITY,
    INCIDENT_STATUS,
} from "./incident.constants.js";

const timelineSchema = new mongoose.Schema(
    {
        action: String,

        previous: String,

        current: String,

        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const incidentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        severity: {
            type: String,
            enum: Object.values(INCIDENT_SEVERITY),
            default: INCIDENT_SEVERITY.LOW,
        },

        status: {
            type: String,
            enum: Object.values(INCIDENT_STATUS),
            default: INCIDENT_STATUS.OPEN,
        },

        category: {
            type: String,
            required: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        resolvedAt: Date,

        timeline: [timelineSchema],

        aiSummary: String,

        aiSuggestions: [String],
    },
    {
        timestamps: true,
    }

);

incidentSchema.index({ status: 1 });

incidentSchema.index({ severity: 1 });

incidentSchema.index({ assignedTo: 1 });

incidentSchema.index({ createdAt: -1 });

const Incident = mongoose.model("Incident", incidentSchema);

export default Incident;