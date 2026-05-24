import asyncHandler from "../../utils/asyncHandler.js";

import {
    getDashboardStats,
    getSeverityDistribution,
    getIncidentTrends,
} from "./dashboard.service.js";


// =========================
// STATS
// =========================
export const getDashboardStatsController =
    asyncHandler(async (req, res) => {
        const stats =
            await getDashboardStats();

        res.status(200).json({
            success: true,
            data: stats,
        });
    });


// =========================
// SEVERITY DISTRIBUTION
// =========================
export const getSeverityDistributionController =
    asyncHandler(async (req, res) => {
        const distribution =
            await getSeverityDistribution();

        res.status(200).json({
            success: true,
            data: distribution,
        });
    });


// =========================
// INCIDENT TRENDS
// =========================
export const getIncidentTrendsController =
    asyncHandler(async (req, res) => {
        const trends =
            await getIncidentTrends();

        res.status(200).json({
            success: true,
            data: trends,
        });
    });