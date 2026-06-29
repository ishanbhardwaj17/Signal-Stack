import { useState } from "react";
import { createIncident } from "../services/incident.api";

const INITIAL_FORM = {
  title: "",
  description: "",
  category: "application",
  service: "",
  severity: "HIGH",
  metricType: "",
};

const severityOptions = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

const metricOptions = [
  "",
  "cpu",
  "memory",
  "latency",
  "errors",
];

function IncidentCreatePanel({
  onCreated,
}) {
  const [form, setForm] =
    useState(INITIAL_FORM);
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        metricType:
          form.metricType || null,
      };

      const incident =
        await createIncident(payload);

      setForm(INITIAL_FORM);
      setSuccess(
        "Incident created successfully."
      );
      onCreated?.(incident);
    } catch (requestError) {
      const response =
        requestError.response?.data;
      setError(
        response?.message ||
          response?.errors?.join(", ") ||
          "Unable to create incident"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900">
          Create Manual Incident
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Use this path when support,
          QA, or an operator reports an
          issue before telemetry has
          caught up.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Field
          label="Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Checkout latency spike on payments-api"
        />

        <Field
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe impact, scope, and what triggered the report"
          textarea
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="application"
          />
          <Field
            label="Service"
            name="service"
            value={form.service}
            onChange={handleChange}
            placeholder="payments-api"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            label="Severity"
            name="severity"
            value={form.severity}
            onChange={handleChange}
            options={severityOptions}
          />
          <SelectField
            label="Metric Context"
            name="metricType"
            value={form.metricType}
            onChange={handleChange}
            options={metricOptions}
            emptyLabel="No metric context"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {submitting
            ? "Creating..."
            : "Create Incident"}
        </button>
      </form>
    </section>
  );
}

function Field({
  label,
  textarea = false,
  ...props
}) {
  const className =
    "w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100";

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      {textarea ? (
        <textarea
          {...props}
          rows={5}
          className={className}
        />
      ) : (
        <input
          {...props}
          className={className}
        />
      )}
    </label>
  );
}

function SelectField({
  label,
  options,
  emptyLabel,
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
            key={option || "empty"}
            value={option}
          >
            {option || emptyLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

export default IncidentCreatePanel;
