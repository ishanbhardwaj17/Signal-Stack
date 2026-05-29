 export const SLA_MINUTES = {
    LOW: 24 * 60,
    MEDIUM: 4 * 60,
    HIGH: 0.1,
    CRITICAL: 0.1,
};

export const getSlaDelayMs = (
    severity
) => {
    return (
        SLA_MINUTES[severity?.toUpperCase()] *
        60 *
        1000
    );
};

export const calculateSlaDueAt = (
    severity
) => {
    const minutes =
        SLA_MINUTES[severity?.toUpperCase()];

    return new Date(
        Date.now() +
        minutes * 60 * 1000
    );
};