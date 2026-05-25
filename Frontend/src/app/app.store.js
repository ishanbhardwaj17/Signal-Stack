import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/state/auth.slice";
import dashboardReducer from "../features/dashboard/state/dashboard.slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
  },
});

export default store;