function AISummaryCard({
  incident,
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">
        AI Incident Intelligence
      </h2>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="mb-1 text-sm font-medium text-gray-500">
            AI Summary
          </p>

          <p className="text-sm leading-6 text-slate-700">
            {incident.aiSummary ||
              "No AI summary available"}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="mb-2 text-sm font-medium text-gray-500">
            Suggested Actions
          </p>

          {incident.aiSuggestions?.length ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {incident.aiSuggestions?.map(
                (
                  suggestion,
                  index
                ) => (
                  <li key={index}>
                    {suggestion}
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">
              No suggested actions yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AISummaryCard;
