// AuthContext.tsx / AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "@/services/api"; // your preconfigured axios instance

type Decoded = { exp?: number; [k: string]: any };

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- helpers ---------------------------------------------------------------
  const setAuthHeader = (token?: string) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  };

  const validateToken = (token: string) => {
    try {
      const decoded: Decoded = jwtDecode(token);
      console.log(decoded);

      if (!decoded?.exp) return null;
      if ((decoded.exp! * 1000) < Date.now()) return null;

      return decoded;
    } catch {
      return null;
    }
  };

  // --- boot: hydrate from localStorage --------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("Token");

    if (token) {
      const decoded = validateToken(token);
      if (decoded) {
        setIsAuthenticated(true);
        setAuthHeader(token); // ⬅ attach header on load
      } else {
        logout();
      }
    } else {
      logout(false); // don't bounce localStorage twice
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- cross-tab auto-logout / login ----------------------------------------
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("Token");
      if (token && validateToken(token)) {
        setIsAuthenticated(true);
        setAuthHeader(token);
      } else {
        logout();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- API -------------------------------------------------------------------
  const login = (Token: string) => {
    const decoded = validateToken(Token);
    if (!decoded) {
      console.warn("Attempted to login with invalid/expired token");
      return false;
    }
    localStorage.setItem("Token", Token);
    setIsAuthenticated(true);
    setAuthHeader(Token);
    return true;
  };

  const logout = (clearStore = true) => {
    if (clearStore) {
      localStorage.removeItem("Token");
    }
    setUserData(null);
    setIsAuthenticated(false);
    setAuthHeader(undefined);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
