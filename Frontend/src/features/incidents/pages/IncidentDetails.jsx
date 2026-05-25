import { useEffect } from "react";

import { useParams } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import {
  setIncidentLoading,
  setSelectedIncident,
  setIncidentError,
} from "../state/incident.slice";

import { fetchIncidentById } from "../services/incident.api";

import IncidentHeader from "../components/IncidentHeader";

import AISummaryCard from "../components/AISummaryCard";

import TimelineCard from "../components/TimelineCard";

import IncidentActions from "../components/IncidentActions";

function IncidentDetails() {
  const { id } = useParams();

  const dispatch = useDispatch();

  const {
    selectedIncident,
    loading,
  } = useSelector(
    (state) => state.incidents
  );

  const loadIncident =
    async () => {
      try {
        dispatch(
          setIncidentLoading(true)
        );

        const data =
          await fetchIncidentById(id);

        dispatch(
          setSelectedIncident(data)
        );
      } catch (error) {
        dispatch(
          setIncidentError(
            error.message
          )
        );
      }
    };

  useEffect(() => {
    loadIncident();
  }, [id]);

  if (
    loading ||
    !selectedIncident
  ) {
    return (
      <div>Loading incident...</div>
    );
  }

  return (
    <div className="space-y-6">
      <IncidentHeader
        incident={selectedIncident}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left */}
        <div className="space-y-6 xl:col-span-2">
          <AISummaryCard
            incident={selectedIncident}
          />

          <TimelineCard
            timeline={
              selectedIncident.timeline
            }
          />
        </div>

        {/* Right */}
        <div>
          <IncidentActions
            incident={selectedIncident}
            refreshIncident={
              loadIncident
            }
          />
        </div>
      </div>
    </div>
  );
}

export default IncidentDetails;