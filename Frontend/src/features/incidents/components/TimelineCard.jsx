function TimelineCard({
    timeline,
}) {
    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
                Incident Timeline
            </h2>

            <div className="space-y-4">
                {timeline?.map((event, index) => (
                    <div
                        key={index}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                        <p className="font-medium text-slate-900">
                            {event.action}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            {new Date(
                                event.timestamp ||
                                    event.createdAt
                            ).toLocaleString()}
                        </p>

                        {event.current && (
                            <p className="mt-2 text-sm text-slate-700">
                                Current: {event.current}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TimelineCard;
