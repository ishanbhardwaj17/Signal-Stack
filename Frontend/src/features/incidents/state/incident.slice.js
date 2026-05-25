import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  incidents: [],

  total: 0,

  page: 1,

  totalPages: 1,

  loading: false,

  error: null,
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
  },
});

export const {
  setIncidentLoading,
  setIncidents,
  setIncidentError,
} = incidentSlice.actions;

export default incidentSlice.reducer;