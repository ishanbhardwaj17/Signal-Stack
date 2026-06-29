import api from "../../../shared/services/api";

export const fetchAlertRules =
    async () => {
        const response = await api.get(
            "/monitoring/rules"
        );

        return response.data.data;
    };

export const createAlertRule =
    async (payload) => {
        const response = await api.post(
            "/monitoring/rules",
            payload
        );

        return response.data.data;
    };

export const updateAlertRule =
    async (ruleId, payload) => {
        const response = await api.patch(
            `/monitoring/rules/${ruleId}`,
            payload
        );

        return response.data.data;
    };

export const deleteAlertRule =
    async (ruleId) => {
        const response = await api.delete(
            `/monitoring/rules/${ruleId}`
        );

        return response.data;
    };

export const fetchMonitoringActivity =
    async () => {
        const response = await api.get(
            "/monitoring/activity"
        );

        return response.data.data;
    };

export const ingestMetric =
    async (payload) => {
        const response = await api.post(
            "/monitoring/ingest",
            payload
        );

        return response.data.data;
    };
