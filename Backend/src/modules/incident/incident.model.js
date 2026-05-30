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

        service: {
            type: String,
            required: true,
            trim: true,
        },

        metricType: {
            type: String,

            enum: [
                'cpu',
                'memory',
                'latency',
                'errors',
            ],

            default: null,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
            default: null,
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        triggeredByAlert: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Alert",
            default: null,
        },
        source: {
            type: String,
            enum: ["manual", "monitoring"],
            default: "manual",
        },
        resolvedAt: Date,

        slaDueAt: {
            type: Date,
            default: null,
        },

        slaBreached: {
            type: Boolean,
            default: false,
        },

        timeline: [timelineSchema],

        aiSummary: String,

        aiSuggestions: [String],

        aiRootCause: String,

        aiRecommendations: [String],

        aiRiskAssessment: String,

        aiSummaryGeneratedAt: Date,

        aiPlaybook: [
            {
                step: Number,
                action: String,
                command: String,
            },
        ],
    },
    {
        timestamps: true,
    }

);

incidentSchema.index({ status: 1 });

incidentSchema.index({ severity: 1 });

incidentSchema.index({ assignedTo: 1 });

incidentSchema.index({ service: 1, metricType: 1, status: 1 });

incidentSchema.index({ createdAt: -1 });

const Incident = mongoose.model("Incident", incidentSchema);

export default Incident;