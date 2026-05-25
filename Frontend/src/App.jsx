import { useEffect } from "react";

import { useSelector } from "react-redux";

import AppRoutes from "./app/app.routes";

import useAuthInit from "./features/auth/hooks/useAuthInit";

import {
  connectSocket,
  disconnectSocket,
} from "./shared/services/socket.service";

function App() {
  useAuthInit();

  const { user } = useSelector(
    (state) => state.auth
  );

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