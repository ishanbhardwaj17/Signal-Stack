import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
    setDashboardLoading,
    setDashboardData,
    setDashboardError,
} from "../state/dashboard.slice";

import {
    fetchDashboardStats,
    fetchSeverityDistribution,
    fetchIncidentTrends,
} from "../services/dashboard.api";

import StatsCard from "../components/StatsCard";

import SeverityChart from "../components/SeverityChart";

import IncidentTrendsChart from "../components/IncidentTrendsChart";

function Dashboard() {
    const dispatch = useDispatch();

    const {
        stats,
        severityDistribution,
        trends,
        loading,
    } = useSelector(
        (state) => state.dashboard
    );

    useEffect(() => {
        const loadDashboardData =
            async () => {
                try {
                    dispatch(
                        setDashboardLoading(true)
                    );

                    const [
                        statsData,
                        severityData,
                        trendsData,
                    ] = await Promise.all([
                        fetchDashboardStats(),

                        fetchSeverityDistribution(),

                        fetchIncidentTrends(),
                    ]);

                    dispatch(
                        setDashboardData({
                            stats: statsData,

                            severityDistribution:
                                severityData,

                            trends: trendsData,
                        })
                    );
                } catch (error) {
                    dispatch(
                        setDashboardError(
                            error.message
                        )
                    );
                }
            };

        loadDashboardData();
    }, [dispatch]);

    if (loading || !stats) {
        return (
            <div className="text-xl">
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">
                    Operations Dashboard
                </h1>

                <p className="text-gray-500">
                    Real-time incident monitoring
                    and response
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                <StatsCard
                    title="Total Incidents"
                    value={stats.totalIncidents}
                />

                <StatsCard
                    title="Open Incidents"
                    value={stats.openIncidents}
                />

                <StatsCard
                    title="Critical Incidents"
                    value={stats.criticalIncidents}
                />

                <StatsCard
                    title="Resolved Incidents"
                    value={stats.resolvedIncidents}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <SeverityChart
                    data={severityDistribution}
                />

                <IncidentTrendsChart
                    data={trends}
                />
            </div>
        </div>
    );
}

export default Dashboard;