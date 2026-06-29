import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    incidents: [],

    total: 0,

    page: 1,

    totalPages: 1,

    loading: false,

    error: null,

    selectedIncident: null,

    liveFeed: [],
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

        addLiveIncident: (state, action) => {
            const incomingEvent =
                action.payload;
            const incomingKey = [
                incomingEvent.type,
                incomingEvent.timestamp,
                incomingEvent.meta
                    ?.incidentId,
            ].join(":");

            const alreadyExists =
                state.liveFeed.some((event) => {
                    const eventKey = [
                        event.type,
                        event.timestamp,
                        event.meta
                            ?.incidentId,
                    ].join(":");

                    return eventKey === incomingKey;
                });

            if (alreadyExists) {
                return;
            }

            state.liveFeed.unshift(action.payload);

            state.liveFeed = state.liveFeed.slice(0, 20);
        },

        clearLiveFeed: (state) => {
            state.liveFeed = [];
        },
    },
});

export const {
    setIncidentLoading,
    setIncidents,
    setIncidentError,
    setSelectedIncident,
    addLiveIncident,
    clearLiveFeed,
} = incidentSlice.actions;

export default incidentSlice.reducer;
