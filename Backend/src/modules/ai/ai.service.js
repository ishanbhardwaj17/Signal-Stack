import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import Incident from "../incident/incident.model.js";
import Comment from "../comment/comment.model.js";

import ApiError from "../../utils/ApiError.js";
import { emitSocketEvent } from "../../socket/socket.events.js";
import {
    buildIncidentEventPayload,
    buildLiveFeedEvent,
} from "../incident/incident.service.js";
import {
    buildIncidentAnalysisPrompt,
    buildPlaybookPrompt,
    incidentSummaryPrompt,
} from "./prompt.templates.js";
import {
    INCIDENT_SEVERITY,
} from "../incident/incident.constants.js";
import {
    scheduleIncidentAnalysis,
} from "../../queues/monitoring.queue.js";

export const AI_STATUS = {
    IDLE: "IDLE",
    QUEUED: "QUEUED",
    PROCESSING: "PROCESSING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
};

const analysisSchema = z.object({
    severity: z.enum([
        INCIDENT_SEVERITY.LOW,
        INCIDENT_SEVERITY.MEDIUM,
        INCIDENT_SEVERITY.HIGH,
        INCIDENT_SEVERITY.CRITICAL,
    ]),
    category: z.string().min(2),
    summary: z.string().min(10),
    suggestions: z
        .array(z.string().min(2))
        .min(1),
    rootCause: z.string().min(10),
    recommendations: z
        .array(z.string().min(2))
        .min(1),
    riskAssessment: z.enum([
        "LOW",
        "MEDIUM",
        "HIGH",
    ]),
    playbook: z
        .array(
            z.object({
                step: z.number(),
                action: z.string().min(2),
                command: z.string().min(1),
            })
        )
        .min(1),
});

const playbookSchema = z.object({
    playbook: z
        .array(
            z.object({
                step: z.number(),
                action: z.string().min(2),
                command: z.string().min(1),
            })
        )
        .min(1),
});

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

const cleanAiText = (text) =>
    text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

const parseJsonResponse = (
    text,
    schema,
    label
) => {
    let parsed;

    try {
        parsed = JSON.parse(
            cleanAiText(text)
        );
    } catch {
        throw new ApiError(
            500,
            `${label}: AI returned invalid JSON`
        );
    }

    const result =
        schema.safeParse(parsed);

    if (!result.success) {
        throw new ApiError(
            500,
            `${label}: AI response failed validation`
        );
    }

    return result.data;
};

const getIncidentContext = async (
    incidentId
) => {
    const incident = await Incident.findById(
        incidentId
    );

    if (!incident) {
        throw new ApiError(
            404,
            "Incident not found"
        );
    }

    const comments = await Comment.find({
        incidentId,
    })
        .populate("userId", "name")
        .sort({ createdAt: 1 });

    const formattedComments = comments
        .map(
            (comment) =>
                `${comment.userId?.name || "Unknown"}: ${comment.message}`
        )
        .join("\n");

    return {
        incident,
        formattedComments:
            formattedComments ||
            "No comments",
    };
};

const emitAiProgress = async (
    incidentId,
    eventName,
    feedType,
    message
) => {
    const payload =
        await buildIncidentEventPayload(
            incidentId
        );

    emitSocketEvent(
        eventName,
        payload,
        { room: incidentId.toString() }
    );
    emitSocketEvent(
        "incident:feed",
        buildLiveFeedEvent(
            feedType,
            payload,
            { message }
        )
    );

    return payload;
};

const saveCompletedAnalysis =
    async (incident, analysis) => {
        incident.severity =
            analysis.severity;
        incident.category =
            analysis.category;
        incident.aiSummary =
            analysis.summary;
        incident.aiSuggestions =
            analysis.suggestions;
        incident.aiRootCause =
            analysis.rootCause;
        incident.aiRecommendations =
            analysis.recommendations;
        incident.aiRiskAssessment =
            analysis.riskAssessment;
        incident.aiPlaybook =
            analysis.playbook;
        incident.aiSummaryGeneratedAt =
            new Date();
        incident.aiStatus =
            AI_STATUS.COMPLETED;
        incident.aiLastError = null;
        incident.aiAnalysisCompletedAt =
            new Date();

        incident.timeline.push({
            action:
                "AI_ANALYSIS_COMPLETED",
            current: analysis.severity,
            changedBy: null,
            timestamp: new Date(),
        });
        incident.timeline.push({
            action:
                "AI_STRUCTURED_ANALYSIS_COMPLETED",
            current:
                analysis.riskAssessment,
            changedBy: null,
            timestamp: new Date(),
        });
        incident.timeline.push({
            action:
                "AI_PLAYBOOK_GENERATED",
            current: `${analysis.playbook.length} steps generated`,
            changedBy: null,
            timestamp: new Date(),
        });

        await incident.save();
    };

const runStructuredAiAnalysis =
    async ({
        incident,
        formattedComments,
    }) => {
        const ai = getAIClient();

        const response =
            await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents:
                    buildIncidentAnalysisPrompt(
                        {
                            ...incident.toObject(),
                            comments:
                                formattedComments,
                        }
                    ),
            });

        const text = response.text;

        if (!text) {
            throw new ApiError(
                500,
                "AI returned an empty analysis response"
            );
        }

        return parseJsonResponse(
            text,
            analysisSchema,
            "Structured incident analysis"
        );
    };

export const queueIncidentAnalysis =
    async (incidentId) => {
        const incident =
            await Incident.findById(
                incidentId
            );

        if (!incident) {
            throw new ApiError(
                404,
                "Incident not found"
            );
        }

        const job =
            await scheduleIncidentAnalysis(
                incidentId,
                {
                    removeOnComplete: 50,
                    removeOnFail: 100,
                }
            );

        incident.aiStatus =
            AI_STATUS.QUEUED;
        incident.aiLastError = null;
        incident.aiAnalysisQueuedAt =
            new Date();
        incident.aiAnalysisJobId =
            job.id?.toString?.() || null;

        incident.timeline.push({
            action:
                "AI_ANALYSIS_QUEUED",
            current:
                job.id?.toString?.() ||
                "queued",
            changedBy: null,
            timestamp: new Date(),
        });

        await incident.save();

        return emitAiProgress(
            incidentId,
            "incident:aiQueued",
            "AI_QUEUED",
            "AI analysis queued"
        );
    };

export const runQueuedIncidentAnalysis =
    async (incidentId) => {
        const context =
            await getIncidentContext(
                incidentId
            );
        const { incident } = context;

        incident.aiStatus =
            AI_STATUS.PROCESSING;
        incident.aiLastError = null;
        incident.aiAnalysisStartedAt =
            new Date();

        incident.timeline.push({
            action:
                "AI_ANALYSIS_STARTED",
            current: "processing",
            changedBy: null,
            timestamp: new Date(),
        });

        await incident.save();

        await emitAiProgress(
            incidentId,
            "incident:aiProcessing",
            "AI_PROCESSING",
            "AI analysis is in progress"
        );

        try {
            const analysis =
                await runStructuredAiAnalysis(
                    context
                );

            await saveCompletedAnalysis(
                incident,
                analysis
            );

            return emitAiProgress(
                incidentId,
                "incident:aiCompleted",
                "AI_COMPLETED",
                "AI analysis completed"
            );
        } catch (error) {
            incident.aiStatus =
                AI_STATUS.FAILED;
            incident.aiLastError =
                error.message;
            incident.aiAnalysisCompletedAt =
                new Date();

            incident.timeline.push({
                action:
                    "AI_ANALYSIS_FAILED",
                current:
                    error.message,
                changedBy: null,
                timestamp: new Date(),
            });

            await incident.save();

            await emitAiProgress(
                incidentId,
                "incident:aiFailed",
                "AI_FAILED",
                "AI analysis failed"
            );

            throw error;
        }
    };

export const analyzeIncident =
    async (incidentId) =>
        queueIncidentAnalysis(
            incidentId
        );

export const generateIncidentSummary =
    async (incidentId) => {
        const {
            incident,
            formattedComments,
        } =
            await getIncidentContext(
                incidentId
            );

        const ai = getAIClient();
        const response =
            await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents:
                    incidentSummaryPrompt(
                        {
                            ...incident.toObject(),
                            comments:
                                formattedComments,
                        }
                    ),
            });

        const text = response.text;

        if (!text) {
            throw new ApiError(
                500,
                "Empty response received from AI"
            );
        }

        incident.aiSummary =
            cleanAiText(text);
        incident.aiSummaryGeneratedAt =
            new Date();
        await incident.save();

        return emitAiProgress(
            incidentId,
            "incident:aiSummaryGenerated",
            "AI_SUMMARY_GENERATED",
            "AI summary generated"
        );
    };

export const generateStructuredAnalysis =
    async (incidentId) => {
        await runQueuedIncidentAnalysis(
            incidentId
        );

        return buildIncidentEventPayload(
            incidentId
        );
    };

export const generateIncidentPlaybook =
    async (incidentId) => {
        const { incident } =
            await getIncidentContext(
                incidentId
            );

        const ai = getAIClient();
        const response =
            await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents:
                    buildPlaybookPrompt(
                        incident.toObject()
                    ),
            });

        const text = response.text;

        if (!text) {
            throw new ApiError(
                500,
                "Empty AI response"
            );
        }

        const parsed =
            parseJsonResponse(
                text,
                playbookSchema,
                "Incident playbook"
            );

        incident.aiPlaybook =
            parsed.playbook;
        incident.timeline.push({
            action:
                "AI_PLAYBOOK_GENERATED",
            current: `${parsed.playbook.length} steps generated`,
            changedBy: null,
            timestamp: new Date(),
        });

        await incident.save();

        return buildIncidentEventPayload(
            incidentId
        );
    };
