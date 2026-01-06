import { createContext, useContext, useEffect, useState } from "react";
import http from "../api/http";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const loadMe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      const res = await http.get("/users/me");
      setUser(res.data);
      return res.data;
    } catch {
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const res = await http.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);

    // ✅ retourne le user (avec role)
    const me = await loadMe();
    return me;
  };

  const register = async (data) => {
    const res = await http.post("/auth/register", data);
    localStorage.setItem("token", res.data.token);

    // ✅ retourne le user (avec role)
    const me = await loadMe();
    return me;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
