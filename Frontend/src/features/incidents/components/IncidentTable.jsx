import SeverityBadge from "./SeverityBadge";

import StatusBadge from "./StatusBadge";

import { useNavigate } from "react-router-dom";

function IncidentTable({
    incidents,
}) {
    const navigate = useNavigate();

    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <table className="min-w-full">
                <thead className="bg-gray-50">
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
                            className="cursor-pointer border-t hover:bg-gray-50"
                        >
                            <td className="px-6 py-4">
                                {incident.title}
                            </td>

                            <td className="px-6 py-4">
                                <SeverityBadge
                                    severity={
                                        incident.severity
                                    }
                                />
                            </td>

                            <td className="px-6 py-4">
                                <StatusBadge
                                    status={incident.status}
                                />
                            </td>

                            <td className="px-6 py-4">
                                {incident.category}
                            </td>

                            <td className="px-6 py-4">
                                {new Date(
                                    incident.createdAt
                                ).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default IncidentTable;