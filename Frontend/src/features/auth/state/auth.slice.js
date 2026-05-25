import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,

    isAuthenticated: false,

    loading: true,

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

            state.isAuthenticated = !!action.payload.user;

            state.error = null;

            state.loading = false;
        },

        setError: (state, action) => {
            state.error = action.payload;

            state.loading = false;
        },

        logout: (state) => {
            state.user = null;

            state.isAuthenticated = false;

            state.loading = false;

            state.error = null;
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