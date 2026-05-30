import asyncHandler from "../../utils/asyncHandler.js";
import { analyzeIncident, generateIncidentSummary, generateStructuredAnalysis, generateIncidentPlaybook } from "./ai.service.js";

export const analyzeIncidentController =
    asyncHandler(async (req, res) => {
        const incident = await analyzeIncident(req.params.id);

        res.status(200).json({
            success: true,
            message: "Incident analyzed successfully",
            data: incident,
        });
    });

export const generateIncidentSummaryController =
    asyncHandler(async (req, res) => {
        const summary = await generateIncidentSummary(req.params.id);

        res.status(200).json({
            success: true,
            message: "Incident summary generated successfully",
            data: summary,
        });
    });

export const generateStructuredAnalysisController =
    asyncHandler(async (req, res) => {
        const incident = await generateStructuredAnalysis(req.params.id);

        res.status(200).json({
            success: true,
            message: "Incident structured analysis generated successfully",
            data: incident,
        });
    });

export const generatePlaybookController =
asyncHandler(async (req, res) => {
    const incident =
        await generateIncidentPlaybook(
            req.params.id
        );

    res.status(200).json({
        success: true,
        message:
            "Incident playbook generated successfully",
        data: incident,
    });
});