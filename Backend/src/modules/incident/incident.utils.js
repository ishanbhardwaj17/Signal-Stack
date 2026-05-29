import { STATUS_TRANSITIONS } from './incident.constants.js';

export const SEVERITY_RANK = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
};

export const isValidTransition = (
    currentStatus,
    nextStatus
) => {
    return (
        STATUS_TRANSITIONS[currentStatus]?.includes(
            nextStatus
        ) || false
    );
};

export const shouldEscalateSeverity = (
    currentSeverity,
    newSeverity
) => {
    return (
        SEVERITY_RANK[newSeverity?.toUpperCase()] >
        SEVERITY_RANK[currentSeverity?.toUpperCase()]
    );
};