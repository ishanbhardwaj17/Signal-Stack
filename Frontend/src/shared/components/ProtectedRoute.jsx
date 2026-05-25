import { useSelector } from "react-redux";

import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { isAuthenticated, checkingAuth } = useSelector(
    (state) => state.auth
  );

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Checking session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;