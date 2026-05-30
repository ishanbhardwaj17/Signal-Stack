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