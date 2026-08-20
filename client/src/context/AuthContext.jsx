import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

// Configure axios base defaults


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check current auth status on mount
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const { data } = await api.get('/api/auth/me');
      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      localStorage.removeItem('gym_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      if (data.success) {
        if (data.token) localStorage.setItem('gym_token', data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (formData) => {
    setAuthError(null);
    try {
      const { data } = await api.post('/api/auth/register', formData);
      if (data.success) {
        if (data.token) localStorage.setItem('gym_token', data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('gym_token');
      setUser(null);
    }
  };

  const checkWhitelist = async (email, role) => {
    try {
      const { data } = await api.post('/api/auth/check-whitelist', { email, role });
      return data;
    } catch (err) {
      return { success: false, isWhitelisted: false, message: 'Verification error' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        authError,
        setAuthError,
        login,
        register,
        logout,
        checkWhitelist,
        refreshUser: checkCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
