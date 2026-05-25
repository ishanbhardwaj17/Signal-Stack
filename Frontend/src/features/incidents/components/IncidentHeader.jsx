import SeverityBadge from "./SeverityBadge";

import StatusBadge from "./StatusBadge";

function IncidentHeader({
    incident,
}) {
    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        {incident.title}
                    </h1>

                    <p className="mt-2 text-gray-500">
                        {incident.description}
                    </p>
                </div>

                <div className="flex gap-3">
                    <SeverityBadge
                        severity={incident.severity}
                    />

                    <StatusBadge
                        status={incident.status}
                    />
                </div>
            </div>
        </div>
    );
}

export default IncidentHeader;