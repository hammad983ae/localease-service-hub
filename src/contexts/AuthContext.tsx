
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../api/client';

interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  role?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any } | undefined>;
  signUp: (email: string, password: string, fullName?: string, role?: string) => Promise<{ error: any } | undefined>;
  signOut: () => void;
  updateProfile: (updates: { full_name?: string; phone?: string; address?: string }) => Promise<{ error: any } | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper: Get JWT from localStorage
  const getToken = () => localStorage.getItem('token');
  // Helper: Set JWT to localStorage
  const setToken = (token: string | null) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  };

  // Fetch user profile if token exists
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    apiClient.getCurrentUser()
      .then((res) => {
        setUser(res.user);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Sign in
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiClient.login(email, password);
      const { token, user } = res;
      setToken(token);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setLoading(false);
      return { error: null };
    } catch (error: any) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      setLoading(false);
      return { error: error.message };
    }
  };

  // Sign up
  const signUp = async (email: string, password: string, fullName?: string, role?: string) => {
    setLoading(true);
    try {
      console.log('SIGNUP request data:', { email, password, full_name: fullName, role });
      const res = await apiClient.register({ email, password, full_name: fullName, role });
      console.log('SIGNUP response:', res);
      const { token, user } = res;
      setToken(token);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setLoading(false);
      return { error: null };
    } catch (error: any) {
      setLoading(false);
      return { error: error.message };
    }
  };

  // Sign out
  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
  };

  // Update profile
  const updateProfile = async (updates: { full_name?: string; phone?: string; address?: string }) => {
    const token = getToken();
    if (!token) return { error: 'Not authenticated' };
    setLoading(true);
    try {
      const res = await apiClient.updateUserProfile(updates);
      setUser(res.user);
      setLoading(false);
      return { error: null };
    } catch (error: any) {
      setLoading(false);
      return { error: error.message };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
