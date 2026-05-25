import { useEffect } from "react";

import { useDispatch } from "react-redux";

import AppRoutes from "./app/app.routes";

import {
  logout,
  setCheckingAuth,
  setUser,
} from "./features/auth/state/auth.slice";

import {
  refreshSession,
} from "./features/auth/services/auth.api";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      dispatch(setCheckingAuth(true));

      try {
        const data = await refreshSession();

        if (!isMounted) return;

        dispatch(
          setUser({
            user: data.data.user,
          })
        );
      } catch {
        if (!isMounted) return;

        dispatch(logout());
      } finally {
        if (!isMounted) return;

        dispatch(setCheckingAuth(false));
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;