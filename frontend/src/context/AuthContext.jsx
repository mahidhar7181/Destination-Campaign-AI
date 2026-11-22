import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dc_token') || null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [engineStatus, setEngineStatus] = useState(null);
  const [engineModalOpen, setEngineModalOpen] = useState(false);

  // Dispatch toast helper
  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch engine status
  const refreshEngineStatus = async () => {
    try {
      const data = await api.settings.getStatus();
      if (data.success) {
        setEngineStatus(data);
      }
    } catch (e) {
      console.warn("Could not fetch engine status:", e);
    }
  };

  // Verify token on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.auth.me();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
      refreshEngineStatus();
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.auth.login(email, password);
      if (res.success && res.token) {
        localStorage.setItem('dc_token', res.token);
        setToken(res.token);
        setUser(res.user);
        addToast(res.message || 'Logged in successfully!', 'success');
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      const msg = err.message || 'Failed to connect to authentication server';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const register = async (email, password, fullName, agencyName) => {
    try {
      const res = await api.auth.register(email, password, fullName, agencyName);
      if (res.success && res.token) {
        localStorage.setItem('dc_token', res.token);
        setToken(res.token);
        setUser(res.user);
        addToast(res.message || 'Account created successfully!', 'success');
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      const msg = err.message || 'Registration failed';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('dc_token');
    setToken(null);
    setUser(null);
    addToast('Signed out successfully', 'info');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
        toasts,
        addToast,
        removeToast,
        engineStatus,
        refreshEngineStatus,
        engineModalOpen,
        setEngineModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
