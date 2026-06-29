function AISummaryCard({
  incident,
}) {
  const aiStatus =
    incident.aiStatus || "IDLE";
  const statusTone =
    aiStatus === "COMPLETED"
      ? "bg-emerald-100 text-emerald-700"
      : aiStatus === "FAILED"
        ? "bg-red-100 text-red-700"
        : aiStatus === "PROCESSING"
          ? "bg-amber-100 text-amber-700"
          : aiStatus === "QUEUED"
            ? "bg-cyan-100 text-cyan-700"
            : "bg-slate-100 text-slate-600";

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          AI Incident Intelligence
        </h2>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusTone}`}
        >
          {aiStatus}
        </span>
      </div>

      {incident.aiLastError ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {incident.aiLastError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="mb-1 text-sm font-medium text-gray-500">
            Root Cause
          </p>

          <p className="text-sm leading-6 text-slate-700">
            {incident.aiRootCause ||
              "No root cause analysis available yet."}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="mb-2 text-sm font-medium text-gray-500">
            Recommendations
          </p>

          {incident.aiRecommendations?.length ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {incident.aiRecommendations.map(
                (
                  recommendation,
                  index
                ) => (
                  <li key={index}>
                    {recommendation}
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">
              No recommendations yet.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-500">
            Risk Assessment
          </p>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            {incident.aiRiskAssessment ||
              "Pending"}
          </span>
        </div>

        {incident.aiPlaybook?.length ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium text-gray-500">
              Generated Playbook
            </p>
            {incident.aiPlaybook.map(
              (step) => (
                <div
                  key={`${step.step}-${step.action}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    Step {step.step}:{" "}
                    {step.action}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {step.command}
                  </p>
                </div>
              )
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AISummaryCard;
