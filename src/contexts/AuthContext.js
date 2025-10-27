import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    company: string;
  }) => Promise<void>;
  loading: boolean;
  initializing: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('@auth_token');
        if (token) {
          // Opcional: chamar /auth/profile
          const profile = await authApi.getProfile(token);
          if (profile?.user) {
            setUser({
              id: profile.user.id,
              name: profile.user.name,
              email: profile.user.email,
              company: '',
            });
          }
        }
      } catch (error) {
        // ignore and treat as logged out
      } finally {
        setInitializing(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const resp = await authApi.login(email, password);
      const token = resp?.access_token ?? resp?.data?.access_token;
      const userData = resp?.user ?? resp?.data?.user;
      if (!token) throw new Error('Falha na autenticação');
      await AsyncStorage.setItem('@auth_token', token);
      if (userData) {
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          company: '',
        });
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; password: string; company: string; }) => {
    setLoading(true);
    try {
      const resp = await authApi.register(userData);
      // opcional: auto-login
      return resp;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@auth_token');
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        register,
        loading,
        initializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};