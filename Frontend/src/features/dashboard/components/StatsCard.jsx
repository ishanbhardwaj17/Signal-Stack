function StatsCard({
    title,
    value,
    accent = "slate",
}) {
    const accentStyles = {
        slate: "from-slate-900 to-slate-700 text-white",
        amber: "from-amber-500 to-orange-500 text-white",
        red: "from-rose-500 to-red-600 text-white",
        emerald:
            "from-emerald-500 to-teal-600 text-white",
    };

    return (
        <div className={`rounded-3xl bg-gradient-to-br p-6 shadow-sm ${accentStyles[accent] || accentStyles.slate}`}>
            <p className="text-sm text-white/75">
                {title}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
                {value}
            </h2>
        </div>
    );
}

export default StatsCard;
