import {
  useCallback,
  useEffect,
} from "react";

import { useDispatch, useSelector } from "react-redux";

import {
  setIncidentLoading,
  setIncidents,
  setIncidentError,
} from "../state/incident.slice";

import { fetchIncidents } from "../services/incident.api";

import IncidentTable from "../components/IncidentTable";
import IncidentCreatePanel from "../components/IncidentCreatePanel";

function Incidents() {
  const dispatch = useDispatch();

  const {
    incidents,
    loading,
    error,
    total,
  } = useSelector(
    (state) => state.incidents
  );
  const currentUser = useSelector(
    (state) => state.auth.user
  );

  const loadIncidents = useCallback(
    async () => {
      try {
        dispatch(
          setIncidentLoading(true)
        );

        const data =
          await fetchIncidents();

        dispatch(setIncidents(data));
      } catch (requestError) {
        dispatch(
          setIncidentError(
            requestError.response?.data
              ?.message ||
              requestError.message
          )
        );
      }
    },
    [dispatch]
  );

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  if (loading) {
    return (
      <div>Loading incidents...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[linear-gradient(135deg,#161616_0%,#0f3d56_55%,#f4c95d_100%)] p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-100/80">
              Incident Command
            </p>
            <h1 className="mt-3 text-3xl font-bold">
              Manual response flow is now live
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-100/85">
              Create incidents on the fly, coordinate responders, and move the lifecycle forward during the stakeholder walkthrough.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-cyan-100/75">
              Active incidents in view
            </p>
            <p className="mt-2 text-3xl font-bold">
              {total}
            </p>
            <p className="mt-1 text-xs text-slate-200/80">
              Signed in as {currentUser?.role}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <IncidentCreatePanel
          onCreated={loadIncidents}
        />

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Incident Queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recent incidents across monitoring and manual sources.
              </p>
            </div>
          </div>

          <IncidentTable
            incidents={incidents}
          />
        </div>
      </div>
    </div>
  );
}

export default Incidents;
