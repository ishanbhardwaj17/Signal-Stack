import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../features/auth/pages/Login";

import Register from "../features/auth/pages/Register";

import Dashboard from "../features/dashboard/pages/Dashboard";

import ProtectedRoute from "../shared/components/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" />}
      />
    </Routes>
  );
}

export default AppRoutes;