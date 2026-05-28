import { useEffect } from "react";

import { useDispatch } from "react-redux";

import { getCurrentUser, logoutUser } from "../services/auth.api";

import {
  logout,
  setLoading,
  setUser,
} from "../state/auth.slice";

function useAuthInit() {
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      dispatch(setLoading(true));

      try {
        const response = await getCurrentUser();

        if (!isMounted) return;

        dispatch(
          setUser({
            user: response.data.user,
          })
        );
      } catch {
        if (isMounted) {
          try {
            await logoutUser();
          } catch {
            // Ignore logout failures during bootstrap cleanup.
          }

          dispatch(logout());
        }
      } finally {
        if (isMounted) {
          dispatch(setLoading(false));
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);
}

export default useAuthInit;
