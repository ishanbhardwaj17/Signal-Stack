import SeverityBadge from "./SeverityBadge";

import StatusBadge from "./StatusBadge";

import { useNavigate } from "react-router-dom";

function IncidentTable({
    incidents,
}) {
    const navigate = useNavigate();

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                            Title
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold">
                            Severity
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold">
                            Status
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold">
                            Category
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold">
                            Assignee
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold">
                            Source
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold">
                            Created
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {incidents.map((incident) => (
                        <tr
                            key={incident._id}
                            onClick={() =>
                                navigate(
                                    `/incidents/${incident._id}`
                                )
                            }
                            className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50"
                        >
                            <td className="px-6 py-4 align-top">
                                <p className="font-medium text-slate-900">
                                    {incident.title}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {incident.service}
                                </p>
                            </td>

                            <td className="px-6 py-4 align-top">
                                <SeverityBadge
                                    severity={
                                        incident.severity
                                    }
                                />
                            </td>

                            <td className="px-6 py-4 align-top">
                                <StatusBadge
                                    status={incident.status}
                                />
                            </td>

                            <td className="px-6 py-4 align-top text-sm text-slate-600">
                                {incident.category}
                            </td>

                            <td className="px-6 py-4 align-top text-sm text-slate-600">
                                {incident.assignedTo?.name ||
                                    "Unassigned"}
                            </td>

                            <td className="px-6 py-4 align-top">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                    {incident.source ||
                                        "manual"}
                                </span>
                            </td>

                            <td className="px-6 py-4 align-top text-sm text-slate-600">
                                {new Date(
                                    incident.createdAt
                                ).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                    {incidents.length === 0 ? (
                        <tr>
                            <td
                                colSpan="7"
                                className="px-6 py-10 text-center text-sm text-slate-500"
                            >
                                No incidents yet. Create one manually or trigger a monitoring rule.
                            </td>
                        </tr>
                    ) : null}
                </tbody>
            </table>
        </div>
    );
}

export default IncidentTable;
