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