import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    incidents: [],

    total: 0,

    page: 1,

    totalPages: 1,

    loading: false,

    error: null,

    selectedIncident: null,
};

const incidentSlice = createSlice({
    name: "incidents",

    initialState,

    reducers: {
        setIncidentLoading: (
            state,
            action
        ) => {
            state.loading = action.payload;
        },

        setIncidents: (
            state,
            action
        ) => {
            state.incidents =
                action.payload.data;

            state.total =
                action.payload.total;

            state.page =
                action.payload.page;

            state.totalPages =
                action.payload.totalPages;

            state.loading = false;

            state.error = null;
        },

        setIncidentError: (
            state,
            action
        ) => {
            state.error = action.payload;

            state.loading = false;
        },
        setSelectedIncident: (
            state,
            action
        ) => {
            state.selectedIncident =
                action.payload;

            state.loading = false;

            state.error = null;
        },
    },
});

export const {
    setIncidentLoading,
    setIncidents,
    setIncidentError,
    setSelectedIncident,
} = incidentSlice.actions;

export default incidentSlice.reducer;