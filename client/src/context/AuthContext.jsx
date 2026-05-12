import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("pulseboard_token");

      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const response = await api.get("/api/auth/me");
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem("pulseboard_token");
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    loadUser();
  }, []);

  async function register(formData) {
    const response = await api.post("/api/auth/register", formData);

    localStorage.setItem("pulseboard_token", response.data.token);
    setUser(response.data.user);

    return response.data;
  }

  async function login(formData) {
    const response = await api.post("/api/auth/login", formData);

    localStorage.setItem("pulseboard_token", response.data.token);
    setUser(response.data.user);

    return response.data;
  }

  function logout() {
    localStorage.removeItem("pulseboard_token");
    setUser(null);
  }

  const value = {
    user,
    isCheckingAuth,
    isLoggedIn: Boolean(user),
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}