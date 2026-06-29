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
        <div className="min-w-0 rounded-lg bg-white p-6 shadow-sm">
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
                        <Pie
                            data={data}
                            dataKey="count"
                            nameKey="severity"
                            outerRadius={100}
                            label
                        >
                            {data.map(
                                (entry, index) => (
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

                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default SeverityChart;
