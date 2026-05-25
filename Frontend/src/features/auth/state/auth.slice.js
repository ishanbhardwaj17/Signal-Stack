import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,

    token:
        localStorage.getItem("token") || null,

    loading: false,

    error: null,
};

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        setUser: (state, action) => {
            state.user = action.payload.user;

            state.token = action.payload.token;

            if (state.token) {
                localStorage.setItem("token", state.token);
            }

            state.error = null;
        },

        setError: (state, action) => {
            state.error = action.payload;

            state.loading = false;
        },

        logout: (state) => {
            state.user = null;

            state.token = null;

            localStorage.removeItem("token");
        },
    },
});

export const {
    setLoading,
    setUser,
    setError,
    logout,
} = authSlice.actions;

export default authSlice.reducer;