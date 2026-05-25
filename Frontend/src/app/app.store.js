import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/state/auth.slice";
import dashboardReducer from "../features/dashboard/state/dashboard.slice";
import incidentReducer from "../features/incidents/state/incident.slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    incidents: incidentReducer,
  },
});

export default store;