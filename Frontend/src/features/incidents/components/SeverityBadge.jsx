function SeverityBadge({
    severity,
}) {
    const severityStyles = {
        LOW: "bg-green-100 text-green-700",

        MEDIUM:
            "bg-yellow-100 text-yellow-700",

        HIGH:
            "bg-orange-100 text-orange-700",

        CRITICAL:
            "bg-red-100 text-red-700",
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${severityStyles[severity]
                }`}
        >
            {severity}
        </span>
    );
}

export default SeverityBadge;