import {
    updateIncidentStatus,
    analyzeIncident,
} from "../services/incident.api";

function IncidentActions({
    incident,
    refreshIncident,
}) {
    const handleAnalyze =
        async () => {
            await analyzeIncident(
                incident._id
            );

            refreshIncident();
        };

    const handleStatusChange =
        async (status) => {
            await updateIncidentStatus(
                incident._id,
                status
            );

            refreshIncident();
        };

    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
                Actions
            </h2>

            <div className="flex flex-wrap gap-3">
                <button
                    onClick={handleAnalyze}
                    className="rounded bg-black px-4 py-2 text-white"
                >
                    Run AI Analysis
                </button>

                <button
                    onClick={() =>
                        handleStatusChange(
                            "IN_PROGRESS"
                        )
                    }
                    className="rounded bg-blue-500 px-4 py-2 text-white"
                >
                    Set In Progress
                </button>

                <button
                    onClick={() =>
                        handleStatusChange(
                            "RESOLVED"
                        )
                    }
                    className="rounded bg-green-500 px-4 py-2 text-white"
                >
                    Resolve
                </button>
            </div>
        </div>
    );
}

export default IncidentActions;