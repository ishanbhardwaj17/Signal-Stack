export const ROLES = {
    USER: "USER",
    ENGINEER: "ENGINEER",
    SENIOR_ENGINEER: "SENIOR_ENGINEER",
    ADMIN: "ADMIN",
};

export const normalizeRole = (role) =>
    typeof role === "string"
        ? role.toUpperCase()
        : role;

export const canAssignIncidents = (role) =>
    [
        ROLES.SENIOR_ENGINEER,
        ROLES.ADMIN,
    ].includes(normalizeRole(role));

export const canUpdateIncidentStatus = (
    role
) =>
    [
        ROLES.ENGINEER,
        ROLES.SENIOR_ENGINEER,
        ROLES.ADMIN,
    ].includes(normalizeRole(role));

export const canCloseIncident = (role) =>
    [
        ROLES.SENIOR_ENGINEER,
        ROLES.ADMIN,
    ].includes(normalizeRole(role));

export const canOperateMonitoring = (
    role
) =>
    [
        ROLES.SENIOR_ENGINEER,
        ROLES.ADMIN,
    ].includes(normalizeRole(role));

export const canBeAssignedIncident = (
    role
) =>
    [
        ROLES.ENGINEER,
        ROLES.SENIOR_ENGINEER,
    ].includes(normalizeRole(role));
