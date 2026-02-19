import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/current-user`,
        { withCredentials: true }
      );

      if (response.data?.data?.user) {
        const user = response.data.data.user;
        setCurrentUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userId", user._id);
        return user;
      }
    } catch (error) {
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      sessionStorage.removeItem("accessToken");
      setCurrentUser(null);
    }
    return null;
  };

  const value = {
    currentUser,
    setCurrentUser,
    refreshAuth,
    showLoginModal,
    setShowLoginModal,
    authLoading,
  };

  useEffect(() => {
    const initAuth = async () => {
      await refreshAuth();
      setAuthLoading(false);
    };
    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
