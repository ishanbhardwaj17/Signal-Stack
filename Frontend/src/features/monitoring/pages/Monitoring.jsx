import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  createAlertRule,
  deleteAlertRule,
  fetchAlertRules,
  fetchMonitoringActivity,
  ingestMetric,
  updateAlertRule,
} from "../services/monitoring.api";

const EMPTY_RULE = {
  service: "",
  metricType: "cpu",
  operator: ">=",
  threshold: 90,
  severity: "high",
  isActive: true,
};

const EMPTY_METRIC = {
  service: "",
  metricType: "cpu",
  value: 95,
};

const metricTypes = [
  "cpu",
  "memory",
  "latency",
  "errors",
];

const operators = [
  ">",
  ">=",
  "<",
  "<=",
  "==",
];

const severities = [
  "low",
  "medium",
  "high",
  "critical",
];

const normalizeRole = (role) =>
  typeof role === "string"
    ? role.toUpperCase()
    : role;

function Monitoring() {
  const user = useSelector(
    (state) => state.auth.user
  );
  const [rules, setRules] = useState([]);
  const [activity, setActivity] =
    useState({
      summary: {
        totalRules: 0,
        recentMetrics: 0,
        recentAlerts: 0,
      },
      recentMetrics: [],
      recentAlerts: [],
    });
  const [ruleForm, setRuleForm] =
    useState(EMPTY_RULE);
  const [metricForm, setMetricForm] =
    useState(EMPTY_METRIC);
  const [editingRuleId, setEditingRuleId] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [submittingRule, setSubmittingRule] =
    useState(false);
  const [submittingMetric, setSubmittingMetric] =
    useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const role = normalizeRole(user?.role);
  const canManageRules =
    role === "SENIOR_ENGINEER" ||
    role === "ADMIN";
  const canIngestMetrics =
    canManageRules;

  const loadMonitoring = async () => {
    setLoading(true);
    setError("");

    try {
      const [rulesData, activityData] =
        await Promise.all([
          fetchAlertRules(),
          fetchMonitoringActivity(),
        ]);

      setRules(rulesData);
      setActivity(activityData);
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Unable to load monitoring data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeMonitoring =
      async () => {
        setLoading(true);
        setError("");

        try {
          const [
            rulesData,
            activityData,
          ] = await Promise.all([
            fetchAlertRules(),
            fetchMonitoringActivity(),
          ]);

          if (!isMounted) return;

          setRules(rulesData);
          setActivity(activityData);
        } catch (requestError) {
          if (!isMounted) return;

          setError(
            requestError.response?.data
              ?.message ||
              "Unable to load monitoring data"
          );
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

    initializeMonitoring();

    return () => {
      isMounted = false;
    };
  }, []);

  const rulesByService = useMemo(() => {
    return rules.reduce(
      (accumulator, rule) => {
        const key = rule.service;

        if (!accumulator[key]) {
          accumulator[key] = [];
        }

        accumulator[key].push(rule);
        return accumulator;
      },
      {}
    );
  }, [rules]);

  const handleRuleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setRuleForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : name === "threshold"
            ? Number(value)
            : value,
    }));
  };

  const handleMetricChange = (
    event
  ) => {
    const { name, value } = event.target;

    setMetricForm((current) => ({
      ...current,
      [name]:
        name === "value"
          ? Number(value)
          : value,
    }));
  };

  const resetRuleForm = () => {
    setRuleForm(EMPTY_RULE);
    setEditingRuleId(null);
  };

  const handleRuleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!canManageRules) return;

    setSubmittingRule(true);
    setError("");
    setSuccessMessage("");

    try {
      if (editingRuleId) {
        await updateAlertRule(
          editingRuleId,
          ruleForm
        );
        setSuccessMessage(
          "Alert rule updated."
        );
      } else {
        await createAlertRule(ruleForm);
        setSuccessMessage(
          "Alert rule created."
        );
      }

      resetRuleForm();
      await loadMonitoring();
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Unable to save alert rule"
      );
    } finally {
      setSubmittingRule(false);
    }
  };

  const handleEditRule = (rule) => {
    if (!canManageRules) return;

    setEditingRuleId(rule._id);
    setRuleForm({
      service: rule.service,
      metricType: rule.metricType,
      operator: rule.operator,
      threshold: rule.threshold,
      severity: rule.severity,
      isActive: rule.isActive,
    });
  };

  const handleDeleteRule = async (
    ruleId
  ) => {
    if (!canManageRules) return;

    setError("");
    setSuccessMessage("");

    try {
      await deleteAlertRule(ruleId);
      if (editingRuleId === ruleId) {
        resetRuleForm();
      }
      setSuccessMessage(
        "Alert rule deleted."
      );
      await loadMonitoring();
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Unable to delete alert rule"
      );
    }
  };

  const handleMetricSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!canIngestMetrics) return;

    setSubmittingMetric(true);
    setError("");
    setSuccessMessage("");

    try {
      await ingestMetric(metricForm);
      setMetricForm(EMPTY_METRIC);
      setSuccessMessage(
        "Metric sent to monitoring pipeline. Watch the incidents dashboard for auto-created incidents."
      );
      await loadMonitoring();
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Unable to ingest metric"
      );
    } finally {
      setSubmittingMetric(false);
    }
  };

  if (loading) {
    return (
      <div className="text-xl">
        Loading monitoring...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[linear-gradient(135deg,#07111f_0%,#123d53_55%,#d0f0df_100%)] p-8 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-100/80">
          Monitoring Control Plane
        </p>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Trigger alerts like a live NOC demo
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-cyan-50/85">
              Create threshold rules, push synthetic service metrics, and watch the incident pipeline auto-generate alerts for the stakeholder walkthrough.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryCard
              label="Rules"
              value={
                activity.summary.totalRules
              }
            />
            <SummaryCard
              label="Recent Metrics"
              value={
                activity.summary
                  .recentMetrics
              }
            />
            <SummaryCard
              label="Recent Alerts"
              value={
                activity.summary
                  .recentAlerts
              }
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Alert Rule Catalog
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Rules drive automatic alert and incident creation when ingested metrics breach thresholds.
              </p>
            </div>

            {!canManageRules ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                View only
              </span>
            ) : null}
          </div>

          <div className="space-y-5">
            {Object.keys(rulesByService).length ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No alert rules yet. Add one for a service like `payments-api` or `auth-service`.
              </div>
            ) : (
              Object.entries(rulesByService).map(
                ([service, serviceRules]) => (
                  <div
                    key={service}
                    className="rounded-2xl border border-slate-200"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Service
                        </p>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {service}
                        </h3>
                      </div>

                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                        {
                          serviceRules.length
                        }{" "}
                        rule
                        {serviceRules.length ===
                        1
                          ? ""
                          : "s"}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {serviceRules.map((rule) => (
                        <div
                          key={rule._id}
                          className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
                        >
                          <div className="flex flex-wrap gap-2 text-sm text-slate-700">
                            <RuleChip>
                              {rule.metricType}
                            </RuleChip>
                            <RuleChip>
                              {rule.operator}{" "}
                              {
                                rule.threshold
                              }
                            </RuleChip>
                            <RuleChip>
                              {
                                rule.severity
                              }
                            </RuleChip>
                            <RuleChip
                              tone={
                                rule.isActive
                                  ? "active"
                                  : "inactive"
                              }
                            >
                              {rule.isActive
                                ? "active"
                                : "paused"}
                            </RuleChip>
                          </div>

                          {canManageRules ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleEditRule(
                                    rule
                                  )
                                }
                                className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteRule(
                                    rule._id
                                  )
                                }
                                className="rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              {editingRuleId
                ? "Edit Alert Rule"
                : "Create Alert Rule"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Senior engineers and admins can define the rules that convert service telemetry into incidents.
            </p>

            {!canManageRules ? (
              <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Your role can inspect rules, but only senior engineers or admins can change them.
              </p>
            ) : (
              <form
                onSubmit={handleRuleSubmit}
                className="mt-5 space-y-4"
              >
                <InputField
                  label="Service"
                  name="service"
                  value={ruleForm.service}
                  onChange={
                    handleRuleChange
                  }
                  placeholder="payments-api"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Metric"
                    name="metricType"
                    value={
                      ruleForm.metricType
                    }
                    onChange={
                      handleRuleChange
                    }
                    options={metricTypes}
                  />
                  <SelectField
                    label="Operator"
                    name="operator"
                    value={ruleForm.operator}
                    onChange={
                      handleRuleChange
                    }
                    options={operators}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField
                    label="Threshold"
                    name="threshold"
                    type="number"
                    value={ruleForm.threshold}
                    onChange={
                      handleRuleChange
                    }
                    min="0"
                  />
                  <SelectField
                    label="Severity"
                    name="severity"
                    value={
                      ruleForm.severity
                    }
                    onChange={
                      handleRuleChange
                    }
                    options={severities}
                  />
                </div>

                <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={
                      ruleForm.isActive
                    }
                    onChange={
                      handleRuleChange
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Rule is active and ready to trigger incidents
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={
                      submittingRule
                    }
                    className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {submittingRule
                      ? "Saving..."
                      : editingRuleId
                        ? "Update Rule"
                        : "Create Rule"}
                  </button>

                  {editingRuleId ? (
                    <button
                      type="button"
                      onClick={
                        resetRuleForm
                      }
                      className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                    >
                      Cancel edit
                    </button>
                  ) : null}
                </div>
              </form>
            )}
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Push Test Metric
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              This is the fastest demo path: send a synthetic metric that breaches a rule and let the worker auto-create an incident.
            </p>

            {!canIngestMetrics ? (
              <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Only senior engineers or admins can inject monitoring events from the UI.
              </p>
            ) : (
              <form
                onSubmit={handleMetricSubmit}
                className="mt-5 space-y-4"
              >
                <InputField
                  label="Service"
                  name="service"
                  value={metricForm.service}
                  onChange={
                    handleMetricChange
                  }
                  placeholder="payments-api"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Metric"
                    name="metricType"
                    value={
                      metricForm.metricType
                    }
                    onChange={
                      handleMetricChange
                    }
                    options={metricTypes}
                  />
                  <InputField
                    label="Value"
                    name="value"
                    type="number"
                    value={metricForm.value}
                    onChange={
                      handleMetricChange
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    submittingMetric
                  }
                  className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {submittingMetric
                    ? "Sending..."
                    : "Send Metric"}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ActivityCard
          title="Recent Metrics"
          subtitle="Latest telemetry events that were queued for evaluation."
          items={activity.recentMetrics}
          renderItem={(metric) => (
            <>
              <p className="font-semibold text-slate-900">
                {metric.service}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {metric.metricType} recorded{" "}
                <span className="font-semibold text-slate-700">
                  {metric.value}
                </span>
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {new Date(
                  metric.createdAt
                ).toLocaleString()}
              </p>
            </>
          )}
        />

        <ActivityCard
          title="Recent Alerts"
          subtitle="Alerts produced by the rules engine, including linked incidents when available."
          items={activity.recentAlerts}
          renderItem={(alert) => (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">
                  {alert.service}
                </p>
                <RuleChip>
                  {alert.severity}
                </RuleChip>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {alert.message}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {alert.incidentId?.title
                  ? `Linked incident: ${alert.incidentId.title} (${alert.incidentId.status})`
                  : "No incident linked yet"}
              </p>
            </>
          )}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
      <p className="text-xs uppercase tracking-wide text-cyan-100/75">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

function ActivityCard({
  title,
  subtitle,
  items,
  renderItem,
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {subtitle}
      </p>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
            Nothing here yet.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              {renderItem(item)}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function InputField({
  label,
  ...props
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}

function SelectField({
  label,
  options,
  ...props
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <select
        {...props}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function RuleChip({
  children,
  tone = "default",
}) {
  const toneClass =
    tone === "active"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "inactive"
        ? "bg-slate-200 text-slate-500"
        : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${toneClass}`}
    >
      {children}
    </span>
  );
}

export default Monitoring;
