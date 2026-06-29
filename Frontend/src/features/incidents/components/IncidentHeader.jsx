import SeverityBadge from "./SeverityBadge";

import StatusBadge from "./StatusBadge";

function IncidentHeader({
    incident,
}) {
    return (
        <div className="rounded-3xl bg-[linear-gradient(135deg,#0f172a_0%,#0e7490_58%,#e2f3f7_100%)] p-6 text-white shadow-xl">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
                        {incident.source || "manual"} incident
                    </p>
                    <h1 className="text-3xl font-bold">
                        {incident.title}
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm text-slate-100/85">
                        {incident.description}
                    </p>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <MetaBlock
                            label="Service"
                            value={incident.service}
                        />
                        <MetaBlock
                            label="Category"
                            value={incident.category}
                        />
                        <MetaBlock
                            label="Assigned To"
                            value={
                                incident.assignedTo
                                    ?.name ||
                                "Unassigned"
                            }
                        />
                        <MetaBlock
                            label="Created By"
                            value={
                                incident.createdBy
                                    ?.name ||
                                "System"
                            }
                        />
                    </div>
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

function MetaBlock({
    label,
    value,
}) {
    return (
        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-cyan-100/70">
                {label}
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
                {value}
            </p>
        </div>
    );
}

export default IncidentHeader;
