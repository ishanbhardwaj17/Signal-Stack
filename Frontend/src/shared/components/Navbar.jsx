import { useDispatch, useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";

import { logout } from "../../features/auth/state/auth.slice";

import api from "../services/api";

function Navbar() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { user } = useSelector(
    (state) => state.auth
  );

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");

      dispatch(logout());

      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div>
        <h2 className="text-xl font-semibold">
          Welcome, {user?.name}
        </h2>

        <p className="text-sm text-gray-500">
          {user?.role}
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="rounded bg-black px-4 py-2 text-white"
      >
        Logout
      </button>
    </header>
  );
}

export default Navbar;