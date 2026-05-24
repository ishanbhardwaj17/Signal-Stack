import asyncHandler from "../../utils/asyncHandler.js";

import { analyzeIncident } from "./ai.service.js";

export const analyzeIncidentController =
    asyncHandler(async (req, res) => {
        const incident = await analyzeIncident(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message:
                "Incident analyzed successfully",
            data: incident,
        });
    });