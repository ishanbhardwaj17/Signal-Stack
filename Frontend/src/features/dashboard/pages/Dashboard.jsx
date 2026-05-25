import { useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";

import { logout } from "../../auth/state/auth.slice";

import { logoutUser } from "../../auth/services/auth.api";

function Dashboard() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-4">Welcome to the dashboard.</p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
