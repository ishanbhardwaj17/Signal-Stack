import {
    PieChart,
    Pie,
    Tooltip,
    Cell,
    ResponsiveContainer,
} from "recharts";

const COLORS = [
    "#22c55e",
    "#eab308",
    "#f97316",
    "#ef4444",
];

function SeverityChart({ data }) {
    return (
        <div className="min-w-0 rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
                Severity Distribution
            </h2>

            <div className="h-80">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minWidth={0}
                    minHeight={240}
                >
                    <PieChart>
                        {data.length ? (
                            <Pie
                                data={data}
                                dataKey="count"
                                nameKey="severity"
                                outerRadius={100}
                                label
                            >
                                {data.map(
                                    (
                                        entry,
                                        index
                                    ) => (
                                        <Cell
                                            key={index}
                                            fill={
                                                COLORS[
                                                    index %
                                                        COLORS.length
                                                ]
                                            }
                                        />
                                    )
                                )}
                            </Pie>
                        ) : null}

                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {!data.length ? (
                <p className="mt-3 text-sm text-slate-500">
                    Severity distribution will appear once incidents are available.
                </p>
            ) : null}
        </div>
    );
}

export default SeverityChart;
