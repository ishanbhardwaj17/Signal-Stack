import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    stats: null,

    severityDistribution: [],

    trends: [],

    loading: false,

    error: null,
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

            state.error = null;
        },

        setDashboardError: (
            state,
            action
        ) => {
            state.error = action.payload;

            state.loading = false;
        },
    },
});

export const {
    setDashboardLoading,
    setDashboardData,
    setDashboardError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;