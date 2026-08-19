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
      setUser(null);
    }
  };

  // Quick 1-Click Demo Profiles for fast evaluation & testing
  const quickLogin = async (roleName) => {
    let email = 'admin@smartgym.com';
    let pass = 'Admin@12345';

    if (roleName === 'trainer') {
      email = 'trainer.alex@smartgym.com';
      pass = 'Trainer@12345';
    } else if (roleName === 'trainer-sarah') {
      email = 'trainer.sarah@smartgym.com';
      pass = 'Trainer@12345';
    } else if (roleName === 'member') {
      email = 'jordan.member@gmail.com';
      pass = 'Member@12345';
    } else if (roleName === 'member-elena') {
      email = 'elena.member@gmail.com';
      pass = 'Member@12345';
    }

    return await login(email, pass);
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
        quickLogin,
        checkWhitelist,
        refreshUser: checkCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
