import Incident from "../incident/incident.model.js";

import {
    INCIDENT_STATUS,
    INCIDENT_SEVERITY,
} from "../incident/incident.constants.js";


// =========================
// OVERALL STATS
// =========================
export const getDashboardStats =
    async () => {
        const totalIncidents =
            await Incident.countDocuments();

        const openIncidents =
            await Incident.countDocuments({
                status: {
                    $in: [
                        INCIDENT_STATUS.OPEN,
                        INCIDENT_STATUS.TRIAGED,
                        INCIDENT_STATUS.IN_PROGRESS,
                        INCIDENT_STATUS.MONITORING,
                    ],
                },
            });

        const criticalIncidents =
            await Incident.countDocuments({
                severity:
                    INCIDENT_SEVERITY.CRITICAL,
            });

        const resolvedIncidents =
            await Incident.countDocuments({
                status: INCIDENT_STATUS.RESOLVED,
            });

        return {
            totalIncidents,
            openIncidents,
            criticalIncidents,
            resolvedIncidents,
        };
    };


// =========================
// SEVERITY DISTRIBUTION
// =========================
export const getSeverityDistribution =
    async () => {
        const distribution =
            await Incident.aggregate([
                {
                    $group: {
                        _id: "$severity",
                        count: {
                            $sum: 1,
                        },
                    },
                },

                {
                    $project: {
                        _id: 0,
                        severity: "$_id",
                        count: 1,
                    },
                },
            ]);

        return distribution;
    };


// =========================
// INCIDENT TRENDS
// =========================
export const getIncidentTrends =
    async () => {
        const trends =
            await Incident.aggregate([
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt",
                            },
                        },

                        incidents: {
                            $sum: 1,
                        },
                    },
                },

                {
                    $sort: {
                        _id: 1,
                    },
                },

                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        incidents: 1,
                    },
                },
            ]);

        return trends;
    };