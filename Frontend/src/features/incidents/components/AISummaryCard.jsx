function AISummaryCard({
  incident,
}) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">
        AI Incident Intelligence
      </h2>

      <div className="space-y-4">
        <div>
          <p className="mb-1 text-sm font-medium text-gray-500">
            AI Summary
          </p>

          <p>
            {incident.aiSummary ||
              "No AI summary available"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-500">
            Suggested Actions
          </p>

          <ul className="list-disc space-y-1 pl-5">
            {incident.aiSuggestions?.map(
              (suggestion, index) => (
                <li key={index}>
                  {suggestion}
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AISummaryCard;