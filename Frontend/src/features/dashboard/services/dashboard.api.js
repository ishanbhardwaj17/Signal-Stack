import api from "../../../shared/services/api";

export const fetchDashboardStats =
    async () => {
        const response = await api.get(
            "/dashboard/stats"
        );

        return response.data.data;
    };

export const fetchSeverityDistribution =
    async () => {
        const response = await api.get(
            "/dashboard/severity-distribution"
        );

        return response.data.data;
    };

export const fetchIncidentTrends =
    async () => {
        const response = await api.get(
            "/dashboard/trends"
        );

        return response.data.data;
    };