function StatsCard({
    title,
    value,
}) {
    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
                {title}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
                {value}
            </h2>
        </div>
    );
}

export default StatsCard;