import { useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";

import AppRoutes from "./app/app.routes";

import useAuthInit from "./features/auth/hooks/useAuthInit";

import { logout } from "./features/auth/state/auth.slice";

import {
  connectSocket,
  disconnectSocket,
} from "./shared/services/socket.service";

function App() {
  useAuthInit();

  const { user } = useSelector(
    (state) => state.auth
  );

  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => {
      dispatch(logout());
      navigate("/login");
    };

    window.addEventListener("auth:refreshFailed", handler);

    return () => window.removeEventListener("auth:refreshFailed", handler);
  }, [dispatch, navigate]);

  useEffect(() => {
    if (user) {
      connectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user]);

  return <AppRoutes />;
}

export default App;