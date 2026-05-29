import { STATUS_TRANSITIONS } from './incident.constants.js';

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