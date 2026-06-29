import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    stats: null,

    severityDistribution: [],

    trends: [],

    loading: false,

    refreshing: false,

    error: null,

    lastUpdatedAt: null,
};

const dashboardSlice = createSlice({
    name: "dashboard",

    initialState,

    reducers: {
        setDashboardLoading: (
            state,
            action
        ) => {
            state.loading = action.payload;
        },

        setDashboardData: (
            state,
            action
        ) => {
            state.stats = action.payload.stats;

            state.severityDistribution =
                action.payload.severityDistribution;

            state.trends =
                action.payload.trends;

            state.loading = false;

            state.refreshing = false;

            state.error = null;

            state.lastUpdatedAt =
                new Date().toISOString();
        },

        setDashboardError: (
            state,
            action
        ) => {
            state.error = action.payload;

            state.loading = false;

            state.refreshing = false;
        },

        setDashboardRefreshing: (
            state,
            action
        ) => {
            state.refreshing =
                action.payload;
        },
    },
});

export const {
    setDashboardLoading,
    setDashboardData,
    setDashboardError,
    setDashboardRefreshing,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
