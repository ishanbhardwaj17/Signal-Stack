import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../features/auth/pages/Login";

import Register from "../features/auth/pages/Register";

import PublicRoute from "../shared/components/PublicRoute";

import Dashboard from "../features/dashboard/pages/Dashboard";

import Incidents from "../features/incidents/pages/Incidents";

import Monitoring from "../features/monitoring/pages/Monitoring";

import ProtectedRoute from "../shared/components/ProtectedRoute";

import MainLayout from "../layouts/MainLayout";

import IncidentDetails from "../features/incidents/pages/IncidentDetails";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />

        <Route path="/incidents" element={<Incidents />} />

        <Route path="/incidents/:id" element={<IncidentDetails />} />

        <Route path="/monitoring" element={<Monitoring />} />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to="/" />}
      />
    </Routes>
  );
}

export default AppRoutes;