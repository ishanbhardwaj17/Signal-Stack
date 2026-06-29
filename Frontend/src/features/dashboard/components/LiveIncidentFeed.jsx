import { useSelector } from "react-redux";

function LiveIncidentFeed() {
    const liveFeed = useSelector(
        (state) => state.incidents.liveFeed
    );

    return (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                    Live Incident Feed
                </h2>

                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                    {liveFeed.length} recent event
                    {liveFeed.length === 1
                        ? ""
                        : "s"}
                </span>
            </div>

            <div className="space-y-3">
                {liveFeed.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        No live incident activity yet.
                    </p>
                ) : (
                    liveFeed.map((item, index) => (
                        <div
                            key={`${item.type}-${item.timestamp?.toString?.() || index}`}
                            className="rounded-xl bg-gray-50 p-4"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                    {item.type.replaceAll(
                                        "_",
                                        " "
                                    )}
                                </span>

                                <span className="text-xs text-gray-400">
                                    {new Date(
                                        item.timestamp
                                    ).toLocaleTimeString()}
                                </span>
                            </div>

                            <p className="mt-2 text-sm font-medium text-gray-900">
                                {item.message ||
                                    item.incident?.title}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                {item.incident?.title}
                                {item.incident?.service
                                    ? ` - ${item.incident.service}`
                                    : ""}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default LiveIncidentFeed;
