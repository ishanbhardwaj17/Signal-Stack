import asyncHandler from "../../utils/asyncHandler.js";

import {
    createIncident,
    getAllIncidents,
    getIncidentById,
} from "./incident.service.js";

export const createIncidentController =
    asyncHandler(async (req, res) => {
        const incident = await createIncident(
            req.body,
            req.user._id
        );

        res.status(201).json({
            success: true,
            data: incident,
        });
    });

export const getAllIncidentsController =
    asyncHandler(async (req, res) => {
        const incidents = await getAllIncidents(
            req.query
        );

        res.status(200).json({
            success: true,
            total: incidents.total,
            page: incidents.page,
            totalPages: incidents.totalPages,
            data: incidents.incidents,
        });
    });

export const getIncidentByIdController =
    asyncHandler(async (req, res) => {
        const incident = await getIncidentById(
            req.params.id
        );

        res.status(200).json({
            success: true,
            data: incident,
        });
    });