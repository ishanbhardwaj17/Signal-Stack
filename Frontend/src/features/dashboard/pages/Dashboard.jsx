import {
    useCallback,
    useEffect,
} from "react";

import { useDispatch, useSelector } from "react-redux";

import {
    setDashboardLoading,
    setDashboardData,
    setDashboardError,
    setDashboardRefreshing,
} from "../state/dashboard.slice";

import {
    fetchDashboardBundle,
} from "../services/dashboard.api";

import StatsCard from "../components/StatsCard";

import SeverityChart from "../components/SeverityChart";

import IncidentTrendsChart from "../components/IncidentTrendsChart";

import useDashboardSocket from "../hooks/useDashboardSocket";

import LiveIncidentFeed from "../components/LiveIncidentFeed";

function Dashboard() {
    const dispatch = useDispatch();

    const {
        stats,
        severityDistribution,
        trends,
        loading,
        refreshing,
        lastUpdatedAt,
    } = useSelector(
        (state) => state.dashboard
    );

    const loadDashboardData =
        useCallback(
            async ({
                silent = false,
            } = {}) => {
                try {
                    if (silent) {
                        dispatch(
                            setDashboardRefreshing(
                                true
                            )
                        );
                    } else {
                        dispatch(
                            setDashboardLoading(
                                true
                            )
                        );
                    }

                    const dashboardData =
                        await fetchDashboardBundle();

                    dispatch(
                        setDashboardData(
                            dashboardData
                        )
                    );
                } catch (error) {
                    dispatch(
                        setDashboardError(
                            error.response?.data
                                ?.message ||
                                error.message
                        )
                    );
                }
            },
            [dispatch]
        );

    useDashboardSocket({
        onIncidentActivity: () =>
            loadDashboardData({
                silent: true,
            }),
    });

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    if (loading || !stats) {
        return (
            <div className="text-xl">
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-[linear-gradient(135deg,#051520_0%,#0b3144_45%,#f2b84b_100%)] p-8 text-white shadow-xl">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-cyan-100/80">
                            Live Operations
                        </p>
                        <h1 className="mt-3 text-3xl font-bold">
                            Real-time incident monitoring and response
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm text-slate-100/85">
                            This dashboard now refreshes itself from live incident activity, so stakeholders can watch incidents, severity shifts, and recovery progress land without reloading the page.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-100 backdrop-blur">
                            {refreshing
                                ? "Refreshing from live feed"
                                : "Live sync enabled"}
                        </span>
                        <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-slate-100/85 backdrop-blur">
                            Last update:{" "}
                            {lastUpdatedAt
                                ? new Date(
                                      lastUpdatedAt
                                  ).toLocaleTimeString()
                                : "Waiting"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                <StatsCard
                    title="Total Incidents"
                    value={stats.totalIncidents}
                    accent="slate"
                />

                <StatsCard
                    title="Open Incidents"
                    value={stats.openIncidents}
                    accent="amber"
                />

                <StatsCard
                    title="Critical Incidents"
                    value={stats.criticalIncidents}
                    accent="red"
                />

                <StatsCard
                    title="Resolved Incidents"
                    value={stats.resolvedIncidents}
                    accent="emerald"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <SeverityChart
                    data={severityDistribution}
                />

                <IncidentTrendsChart
                    data={trends}
                />
            </div>

            <LiveIncidentFeed />
        </div>
    );
}

export default Dashboard;
