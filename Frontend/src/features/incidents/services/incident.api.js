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