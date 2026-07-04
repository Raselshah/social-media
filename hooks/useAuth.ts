'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { User } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ success: boolean; data: User }>(
        '/api/auth/me'
      );
      setUser(response.data.data);
      setError(null);
    } catch {
      setUser(null);
      setError('Failed to fetch user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize user on mount
  useEffect(() => {
    const task = window.setTimeout(() => {
      void fetchUser();
    }, 0);

    return () => window.clearTimeout(task);
  }, [fetchUser]);

  // Login
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        const response = await axios.post<{ success: boolean; data: User }>(
          '/api/auth/login',
          { email, password }
        );
        setUser(response.data.data);
        setError(null);
        return response.data.data;
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message || 'Login failed'
          : 'Login failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Register
  const register = useCallback(
    async (firstName: string, lastName: string, email: string, password: string) => {
      try {
        setLoading(true);
        const response = await axios.post<{ success: boolean; data: User }>(
          '/api/auth/register',
          { firstName, lastName, email, password }
        );
        setUser(response.data.data);
        setError(null);
        return response.data.data;
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message || 'Registration failed'
          : 'Registration failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Logout
  const logout = useCallback(async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refetchUser: fetchUser,
    isAuthenticated: !!user,
  };
};
