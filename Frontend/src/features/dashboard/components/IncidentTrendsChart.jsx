import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function IncidentTrendsChart({
  data,
}) {
  return (
    <div className="min-w-0 rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">
        Incident Trends
      </h2>

      <div className="h-80">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={240}
        >
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="incidents"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default IncidentTrendsChart;
