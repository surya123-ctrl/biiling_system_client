import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    token: null,
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            localStorage.setItem('authToken', action.payload.token);
            localStorage.setItem('authUser', JSON.stringify(action.payload.user));
        },
        loginFailure: (state, action) => {
            console.log(state, action)
            state.loading = false;
            state.isAuthenticated = false;
            state.token = null;
            state.user = null;
            state.error = action.payload;
        },
        logout: (state) => {
            state.loading = false;
            state.error = null;
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
        }
    }
})

export const { loginStart, loginSuccess, loginFailure, logout} = authSlice.actions;
export default authSlice.reducer;