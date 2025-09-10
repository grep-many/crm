// src/hooks/useAuth.js
import { useDispatch, useSelector } from "react-redux";
import { login, register, logout } from "../redux/authSlice";
import { useCallback } from "react";

export const useAuth = (socket = null) => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  // Login
  const loginUser = useCallback(async (credentials) => {
    return dispatch(login(credentials)).unwrap();
  }, [dispatch]);

  // Register
  const registerUser = useCallback(async (credentials) => {
    return dispatch(register(credentials)).unwrap();
  }, [dispatch]);

  // Logout
  const logoutUser = useCallback(() => {
    dispatch(logout());
    if (socket) socket.emit("userLoggedOut", user?.id);
  }, [dispatch, socket, user]);

  return {
    user,
    loading,
    error,
    loginUser,
    registerUser,
    logoutUser,
  };
};
