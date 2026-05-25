function TimelineCard({
    timeline,
}) {
    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
                Incident Timeline
            </h2>

            <div className="space-y-4">
                {timeline?.map((event, index) => (
                    <div
                        key={index}
                        className="border-l-2 border-black pl-4"
                    >
                        <p className="font-medium">
                            {event.action}
                        </p>

                        <p className="text-sm text-gray-500">
                            {new Date(
                                event.createdAt
                            ).toLocaleString()}
                        </p>

                        {event.current && (
                            <p className="mt-1 text-sm">
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