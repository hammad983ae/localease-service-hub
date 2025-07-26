
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useApolloClient, gql } from '@apollo/client';

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

const API_BASE = 'http://localhost:5002/graphql';

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      full_name
      phone
      address
      role
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        full_name
        phone
        address
        role
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $full_name: String, $role: String) {
    register(email: $email, password: $password, full_name: $full_name, role: $role) {
      token
      user {
        id
        email
        full_name
        phone
        address
        role
      }
    }
  }
`;

const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($full_name: String, $phone: String, $address: String) {
    updateProfile(full_name: $full_name, phone: $phone, address: $address) {
      id
      email
      full_name
      phone
      address
    }
  }
`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();

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
    client
      .query({ query: ME_QUERY, fetchPolicy: 'network-only' })
      .then((res) => {
        setUser(res.data.me);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  // Sign in
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await client.mutate({
        mutation: LOGIN_MUTATION,
        variables: { email, password },
      });
      const { token, user } = res.data.login;
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
      console.log('SIGNUP mutation variables:', { email, password, full_name: fullName, role });
      const res = await client.mutate({
        mutation: REGISTER_MUTATION,
        variables: { email, password, full_name: fullName, role },
      });
      console.log('SIGNUP mutation response:', res);
      const { token, user } = res.data.register;
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
      const res = await client.mutate({
        mutation: UPDATE_PROFILE_MUTATION,
        variables: updates,
      });
      setUser(res.data.updateProfile);
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
