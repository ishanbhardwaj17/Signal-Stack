const normalizeBaseUrl = (value) =>
    value?.replace(/\/+$/, "") || null;

const defaultApiBaseUrl =
    "http://localhost:5000/api";

const configuredApiBaseUrl = normalizeBaseUrl(
    import.meta.env.VITE_API_BASE_URL
);

export const API_BASE_URL =
    configuredApiBaseUrl || defaultApiBaseUrl;

export const SOCKET_URL = normalizeBaseUrl(
    import.meta.env.VITE_SOCKET_URL
) || API_BASE_URL.replace(/\/api$/, "");
