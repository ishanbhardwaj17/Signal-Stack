import { useEffect, useState } from "react";
import { fetchAssignableUsers } from "../../auth/services/auth.api";
import { assignIncident } from "../services/incident.api";

const normalizeRole = (role) =>
  typeof role === "string"
    ? role.toUpperCase()
    : role;

function IncidentAssignmentCard({
  incident,
  currentUser,
  onAssigned,
}) {
  const [users, setUsers] = useState([]);
  const [draftSelectedUserId, setDraftSelectedUserId] =
    useState("");
  const [loadingUsers, setLoadingUsers] =
    useState(false);
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");

  const role = normalizeRole(
    currentUser?.role
  );
  const canAssign =
    role === "SENIOR_ENGINEER" ||
    role === "ADMIN";

  useEffect(() => {
    if (!canAssign) return;

    let isMounted = true;

    const loadUsers = async () => {
      setLoadingUsers(true);

      try {
        const data =
          await fetchAssignableUsers();

        if (!isMounted) return;
        setUsers(data);
      } catch (requestError) {
        if (!isMounted) return;
        setError(
          requestError.response?.data
            ?.message ||
            "Unable to load responders"
        );
      } finally {
        if (isMounted) {
          setLoadingUsers(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [canAssign]);

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const selectedUserId =
      draftSelectedUserId ||
      incident.assignedTo?._id ||
      "";

    if (!selectedUserId) {
      setError(
        "Select an engineer to assign"
      );
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const updatedIncident =
        await assignIncident(
          incident._id,
          selectedUserId
        );
      setDraftSelectedUserId("");
      setSuccess(
        "Incident assignment updated."
      );
      onAssigned?.(updatedIncident);
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Unable to assign incident"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedUserId =
    draftSelectedUserId ||
    incident.assignedTo?._id ||
    "";

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Assignment
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Current owner:{" "}
        <span className="font-semibold text-slate-700">
          {incident.assignedTo?.name ||
            "Unassigned"}
        </span>
      </p>

      {error ? (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      {!canAssign ? (
        <p className="mt-4 text-sm text-slate-500">
          Only senior engineers and
          admins can reassign this
          incident.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Assign responder
            </span>
            <select
              value={selectedUserId}
              onChange={(event) =>
                setDraftSelectedUserId(
                  event.target.value
                )
              }
              disabled={loadingUsers}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="">
                Select a responder
              </option>
              {users.map((user) => (
                <option
                  key={user._id}
                  value={user._id}
                >
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={
              submitting || loadingUsers
            }
            className="rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-300"
          >
            {submitting
              ? "Assigning..."
              : "Assign Incident"}
          </button>
        </form>
      )}
    </div>
  );
}

export default IncidentAssignmentCard;
