import api from "../../../shared/services/api";

export const fetchIncidents = async (
    params = {}
) => {
    const response = await api.get(
        "/incidents",
        {
            params,
        }
    );

    return response.data;
};

export const fetchIncidentById =
    async (id) => {
        const response = await api.get(
            `/incidents/${id}`
        );

        return response.data.data;
    };

export const updateIncidentStatus =
    async (id, status) => {
        const response = await api.patch(
            `/incidents/${id}/status`,
            {
                status,
            }
        );

        return response.data.data;
    };

export const analyzeIncident =
    async (id) => {
        const response = await api.post(
            `/ai/incidents/${id}/analyze`
        );

        return response.data.data;
    };

export const fetchComments =
    async (incidentId) => {
        const response = await api.get(
            `/comments/${incidentId}`
        );

        return response.data.data;
    };

export const addComment =
    async (incidentId, message) => {
        const response = await api.post(
            `/comments/${incidentId}`,
            {
                message,
            }
        );

        return response.data.data;
    };