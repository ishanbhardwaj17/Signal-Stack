export const buildIncidentContext = (incident) => {
    return {
        title: incident.title,
        severity: incident.severity,
        status: incident.status,
        service: incident.service,
        metricType: incident.metricType,
        slaBreached: incident.slaBreached,
        timeline: incident.timeline,
        // aiSummaryGeneratedAt: incident.aiSummaryGeneratedAt,
    };
};

export const generateMockSummary =
    (incident) => {
        return {
            summary:
                `Incident detected on ${incident.service}. Severity is ${incident.severity}. SLA breached: ${incident.slaBreached}.`,

            suggestions: [
                'Investigate service logs',
                'Review recent deployments',
                'Check resource utilization',
            ],
        };
    };