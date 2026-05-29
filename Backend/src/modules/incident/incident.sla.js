 export const SLA_MINUTES = {
    LOW: 24 * 60,
    MEDIUM: 4 * 60,
    HIGH: 60,
    CRITICAL: 15,
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