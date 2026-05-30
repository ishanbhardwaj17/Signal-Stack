import { PLAYBOOK_CONTEXT } from "./playbook.templates.js";

export const buildIncidentAnalysisPrompt = (
    incident
) => {
    return `
You are an expert Site Reliability Engineer.

Analyze the following incident.

Return ONLY valid JSON.

Incident Title:
${incident.title}

Incident Description:
${incident.description}

Current Status:
${incident.status}

Comments:
${incident.comments || "No comments"}

Return JSON in this exact format:

{
  "severity": "LOW | MEDIUM | HIGH | CRITICAL",
  "category": "string",
  "summary": "string",
  "suggestions": ["suggestion1", "suggestion2"]
}
`;
};

export const incidentSummaryPrompt = (
    incident
) => `
You are an SRE incident assistant.

Analyze this incident and provide:

1. Executive Summary
2. Possible Root Cause
3. Recommended Actions

Incident:

${JSON.stringify(
    incident,
    null,
    2
)}
`;

export const structuredIncidentPrompt =
    (
        incident
    ) => `
You are an expert SRE.

Analyze this incident.

Return ONLY valid JSON.

{
  "summary": "string",
  "rootCause": "string",
  "riskAssessment": "string",
  "recommendations": [
     "item1",
     "item2"
  ]
}

Incident:

${JSON.stringify(
        incident,
        null,
        2
    )}
`;

export const buildPlaybookPrompt = (
    incident
) => {
  const context =
    PLAYBOOK_CONTEXT[
      incident.metricType?.toLowerCase()
    ] || "";

    return `
You are a Senior Site Reliability Engineer.

Generate an incident response playbook.

Special Investigation Context:

${context}

Return ONLY valid JSON.

Incident:

${JSON.stringify(incident, null, 2)}

JSON format:

{
  "playbook": [
    {
      "step": 1,
      "action": "string",
      "command": "string"
    }
  ]
}
`;
};