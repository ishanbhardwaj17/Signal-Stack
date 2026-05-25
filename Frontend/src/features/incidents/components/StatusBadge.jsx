function StatusBadge({ status }) {
  const statusStyles = {
    OPEN: "bg-gray-100 text-gray-700",

    TRIAGED:
      "bg-blue-100 text-blue-700",

    IN_PROGRESS:
      "bg-yellow-100 text-yellow-700",

    MONITORING:
      "bg-purple-100 text-purple-700",

    RESOLVED:
      "bg-green-100 text-green-700",

    CLOSED:
      "bg-black text-white",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        statusStyles[status]
      }`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;