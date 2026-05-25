import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,

    isAuthenticated: false,

    loading: false,

    checkingAuth: true,

    error: null,
};

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        setCheckingAuth: (state, action) => {
            state.checkingAuth = action.payload;
        },

        setUser: (state, action) => {
            state.user = action.payload.user;

            state.isAuthenticated = !!action.payload.user;

            state.checkingAuth = false;

            state.error = null;

            state.loading = false;
        },

        setError: (state, action) => {
            state.error = action.payload;

            state.loading = false;

            state.checkingAuth = false;
        },

        logout: (state) => {
            state.user = null;

            state.isAuthenticated = false;

            state.checkingAuth = false;

            state.loading = false;

            state.error = null;
        },
    },
});

export const {
    setLoading,
    setCheckingAuth,
    setUser,
    setError,
    logout,
} = authSlice.actions;

export default authSlice.reducer;