import {
    assignIncident,
    updateIncidentStatus,
    analyzeIncident,
} from "../services/incident.api";

const normalizeRole = (role) =>
    typeof role === "string"
        ? role.toUpperCase()
        : role;

const STATUS_ACTIONS = {
    OPEN: [
        {
            label: "Triaged",
            status: "TRIAGED",
            className:
                "bg-amber-500",
        },
    ],
    TRIAGED: [
        {
            label: "Set In Progress",
            status: "IN_PROGRESS",
            className:
                "bg-blue-500",
        },
    ],
    IN_PROGRESS: [
        {
            label: "Set Monitoring",
            status: "MONITORING",
            className:
                "bg-sky-500",
        },
    ],
    MONITORING: [
        {
            label: "Resolve",
            status: "RESOLVED",
            className:
                "bg-green-500",
        },
    ],
    RESOLVED: [
        {
            label: "Close",
            status: "CLOSED",
            className:
                "bg-gray-700",
        },
    ],
    CLOSED: [],
};

function IncidentActions({
    incident,
    refreshIncident,
    currentUser,
}) {
    const role = normalizeRole(
        currentUser?.role
    );
    const isAssignedEngineer =
        role === "ENGINEER" &&
        incident.assignedTo?._id ===
            currentUser?._id;
    const canRunAi = [
        "ENGINEER",
        "SENIOR_ENGINEER",
        "ADMIN",
    ].includes(role);
    const canTransition =
        role === "SENIOR_ENGINEER" ||
        role === "ADMIN" ||
        isAssignedEngineer;
    const isAiBusy =
        incident.aiStatus ===
            "QUEUED" ||
        incident.aiStatus ===
            "PROCESSING";
    const availableActions =
        (
            STATUS_ACTIONS[
                incident.status
            ] || []
        ).filter((action) => {
            if (
                action.status ===
                "CLOSED"
            ) {
                return (
                    role ===
                        "SENIOR_ENGINEER" ||
                    role === "ADMIN"
                );
            }

            return canTransition;
        });

    const handleAnalyze =
        async () => {
            if (!canRunAi) return;

            await analyzeIncident(
                incident._id
            );

            refreshIncident();
        };

    const handleStatusChange =
        async (status) => {
            if (!canTransition) return;

            await updateIncidentStatus(
                incident._id,
                status
            );

            refreshIncident();
        };

    const handleAutoAssignToMe =
        async () => {
            if (
                role !== "ENGINEER" &&
                role !== "SENIOR_ENGINEER"
            ) {
                return;
            }

            await assignIncident(
                incident._id,
                currentUser._id
            );

            refreshIncident();
        };

    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
                Actions
            </h2>

            {!canRunAi && !canTransition ? (
                <p className="mb-4 text-sm text-gray-500">
                    Your role can view this
                    incident, but only the
                    assigned engineer, a
                    senior engineer, or an
                    admin can run response
                    actions.
                </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
                {canRunAi ? (
                    <button
                        onClick={handleAnalyze}
                        disabled={isAiBusy}
                        className="rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                        {isAiBusy
                            ? "AI Running..."
                            : "Queue AI Analysis"}
                    </button>
                ) : null}

                {!incident.assignedTo &&
                (
                    role === "ENGINEER" ||
                    role ===
                        "SENIOR_ENGINEER"
                ) ? (
                    <button
                        onClick={
                            handleAutoAssignToMe
                        }
                        className="rounded bg-cyan-600 px-4 py-2 text-white"
                    >
                        Assign To Me
                    </button>
                ) : null}

                {availableActions.map(
                    (action) => (
                        <button
                            key={action.status}
                            onClick={() =>
                                handleStatusChange(
                                    action.status
                                )
                            }
                            className={`rounded px-4 py-2 text-white ${action.className}`}
                        >
                            {action.label}
                        </button>
                    )
                )}
            </div>
        </div>
    );
}

export default IncidentActions;
