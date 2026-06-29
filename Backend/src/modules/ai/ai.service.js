import { GoogleGenAI } from "@google/genai";

import Incident from "../incident/incident.model.js";
import Comment from "../comment/comment.model.js";

import ApiError from "../../utils/ApiError.js";

import { emitSocketEvent } from "../../socket/socket.events.js";
import {
    buildIncidentEventPayload,
    buildLiveFeedEvent,
} from "../incident/incident.service.js";

import { buildIncidentAnalysisPrompt } from "./prompt.templates.js";
import { incidentSummaryPrompt } from "./prompt.templates.js";
import { buildPlaybookPrompt } from "./prompt.templates.js";

import {
    INCIDENT_SEVERITY,
} from "../incident/incident.constants.js";

// Create AI client lazily
const getAIClient = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new ApiError(
            500,
            "GEMINI_API_KEY is missing in environment variables"
        );
    }

    return new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
};

export const analyzeIncident = async (
    incidentId
) => {
    // Fetch incident
    const incident = await Incident.findById(
        incidentId
    );

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    // Fetch comments
    const comments = await Comment.find({
        incidentId,
    })
        .populate("userId", "name")
        .sort({ createdAt: 1 });

    // Format comments for AI context
    const formattedComments = comments
        .map(
            (comment) =>
                `${comment.userId.name}: ${comment.message}`
        )
        .join("\n");

    // Build prompt
    const prompt =
        buildIncidentAnalysisPrompt({
            ...incident.toObject(),
            comments:
                formattedComments || "No comments",
        });

    // Initialize AI client
    const ai = getAIClient();

    // Generate AI response
    const response =
        await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

    const text = response.text;

    if (!text) {
        throw new ApiError(
            500,
            "Empty response received from AI"
        );
    }

    // Remove markdown wrappers
    const cleanedResponse = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    let parsedResponse;

    // Safe JSON parsing
    try {
        parsedResponse = JSON.parse(
            cleanedResponse
        );
    } catch (error) {
        console.error(
            "AI RAW RESPONSE:",
            cleanedResponse
        );

        throw new ApiError(
            500,
            "AI returned invalid JSON"
        );
    }

    // Validate severity
    const validSeverities = Object.values(
        INCIDENT_SEVERITY
    );

    if (
        !validSeverities.includes(
            parsedResponse.severity
        )
    ) {
        throw new ApiError(
            500,
            "Invalid severity returned by AI"
        );
    }

    // Validate suggestions
    if (
        !Array.isArray(
            parsedResponse.suggestions
        )
    ) {
        throw new ApiError(
            500,
            "AI suggestions must be an array"
        );
    }

    // Persist AI analysis
    incident.severity =
        parsedResponse.severity;

    incident.category =
        parsedResponse.category;

    incident.aiSummary =
        parsedResponse.summary;

    incident.aiSuggestions =
        parsedResponse.suggestions;

    // Timeline event
    incident.timeline.push({
        action: "AI_ANALYSIS_COMPLETED",

        previous: null,

        current: parsedResponse.severity,

        changedBy: null,
    });

    await incident.save();

    // Emit realtime event
    const payload =
        await buildIncidentEventPayload(
            incidentId
        );

    emitSocketEvent(
        "incident:aiAnalyzed",
        payload,
        { room: incidentId.toString() }
    );
    emitSocketEvent(
        "incident:feed",
        buildLiveFeedEvent(
            "AI_ANALYZED",
            payload,
            {
                message: "AI analysis refreshed the incident",
            }
        )
    );

    return payload;
};

export const generateIncidentSummary = async (incidentId) => {
    // Fetch incident
    const incident = await Incident.findById(incidentId);

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    // Fetch comments
    const comments = await Comment.find({ incidentId })
        .populate("userId", "name")
        .sort({ createdAt: 1 });

    const formattedComments = comments
        .map((comment) => `${comment.userId.name}: ${comment.message}`)
        .join("\n");

    const prompt = incidentSummaryPrompt({
        ...incident.toObject(),
        comments: formattedComments || "No comments",
    });

    const ai = getAIClient();

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    const text = response.text;

    if (!text) {
        throw new ApiError(500, "Empty response received from AI");
    }

    // Return cleaned text
    const cleaned = text.replace(/```/g, "").trim();

    incident.aiSummary = cleaned;

    incident.aiSummaryGeneratedAt = new Date();

    await incident.save();

    const payload =
        await buildIncidentEventPayload(
            incidentId
        );

    emitSocketEvent(
        "incident:aiSummaryGenerated",
        payload,
        { room: incidentId.toString() }
    );
    emitSocketEvent(
        "incident:feed",
        buildLiveFeedEvent(
            "AI_SUMMARY_GENERATED",
            payload,
            {
                message: "AI summary generated",
            }
        )
    );

    return payload;
};

export const generateStructuredAnalysis = async (incidentId) => {
    // Fetch incident
    const incident = await Incident.findById(incidentId);

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    // Fetch comments
    const comments = await Comment.find({ incidentId })
        .populate("userId", "name")
        .sort({ createdAt: 1 });

    const formattedComments = comments
        .map((comment) => `${comment.userId.name}: ${comment.message}`)
        .join("\n");

    const prompt = `You are an expert Site Reliability Engineer.

Analyze the following incident and return ONLY valid JSON in this exact format:

{
  "summary": "string",
  "rootCause": "string",
  "recommendations": ["string"],
  "riskAssessment": "LOW | MEDIUM | HIGH"
}

Incident Title:
${incident.title}

Incident Description:
${incident.description}

Current Status:
${incident.status}

Comments:
${formattedComments || "No comments"}
`;

    const ai = getAIClient();

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    const text = response.text;

    if (!text) {
        throw new ApiError(500, "Empty response received from AI");
    }

    const cleanedResponse = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    let parsed;

    try {
        parsed = JSON.parse(cleanedResponse);
    } catch (err) {
        console.error("AI RAW RESPONSE:", cleanedResponse);
        throw new ApiError(500, "AI returned invalid JSON for structured analysis");
    }

    // Persist structured fields
    incident.aiSummary = parsed.summary;
    incident.aiRootCause = parsed.rootCause;
    incident.aiRecommendations = parsed.recommendations;
    incident.aiRiskAssessment = parsed.riskAssessment;

    incident.timeline.push({
        action: "AI_STRUCTURED_ANALYSIS_COMPLETED",
        previous: null,
        current: incident.aiRiskAssessment || null,
        changedBy: null,
        timestamp: new Date(),
    });

    await incident.save();

    // Emit realtime event
    const payload =
        await buildIncidentEventPayload(
            incidentId
        );

    emitSocketEvent(
        "incident:aiStructuredAnalyzed",
        payload,
        { room: incidentId.toString() }
    );

    return payload;
};

export const generateIncidentPlaybook =
    async (incidentId) => {
    const incident = await Incident.findById(
        incidentId
    );

    if (!incident) {
        throw new ApiError(
            404,
            "Incident not found"
        );
    }

    const prompt = buildPlaybookPrompt(
        incident.toObject()
    );

    const ai = getAIClient();

    const response =
        await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

    const text = response.text;

    if (!text) {
        throw new ApiError(
            500,
            "Empty AI response"
        );
    }

    const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    let parsed;

    try {
        parsed = JSON.parse(cleaned);
    } catch (error) {
        console.log("AI RAW RESPONSE:");
        console.log(cleaned);

        throw new ApiError(
            500,
            "AI returned invalid JSON"
        );
    }

    if (
        !Array.isArray(parsed.playbook)
    ) {
        throw new ApiError(
            500,
            "Invalid playbook format"
        );
    }

    incident.aiPlaybook =
        parsed.playbook;

    incident.timeline.push({
        action:
            "AI_PLAYBOOK_GENERATED",

        previous: null,

        current:
            `${parsed.playbook.length} steps generated`,

        changedBy: null,
    });

    await incident.save();

    return incident;
};
