import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  // While checking auth, don't redirect (prevents flicker)
  if (loading) return null;

  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
}

export default PublicRoute;
