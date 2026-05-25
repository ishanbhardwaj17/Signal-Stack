import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
  setIncidentLoading,
  setIncidents,
  setIncidentError,
} from "../state/incident.slice";

import { fetchIncidents } from "../services/incident.api";

import IncidentTable from "../components/IncidentTable";

function Incidents() {
  const dispatch = useDispatch();

  const {
    incidents,
    loading,
    error,
  } = useSelector(
    (state) => state.incidents
  );

  useEffect(() => {
    const loadIncidents =
      async () => {
        try {
          dispatch(
            setIncidentLoading(true)
          );

          const data =
            await fetchIncidents();

          dispatch(setIncidents(data));
        } catch (error) {
          dispatch(
            setIncidentError(
              error.message
            )
          );
        }
      };

    loadIncidents();
  }, [dispatch]);

  if (loading) {
    return (
      <div>Loading incidents...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Incident Management
        </h1>

        <p className="text-gray-500">
          Track and manage operational
          incidents
        </p>
      </div>

      {error && (
        <div className="text-red-500">
          {error}
        </div>
      )}

      <IncidentTable
        incidents={incidents}
      />
    </div>
  );
}

export default Incidents;