'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/api/auth.api';
import { setupAuthSync } from '@/lib/axios/client';
import { User } from '@/types';
import { ApiClientError } from '@/lib/axios/errors';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await authApi.me();
      return response.data.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    return setupAuthSync(
      () => {
        queryClient.setQueryData(['auth', 'me'], null);
      },
      () => {
        void refetch();
      },
    );
  }, [queryClient, refetch]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await authApi.login({ email, password });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data);
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiClientError ? err.message : 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (input: { firstName: string; lastName: string; email: string; password: string }) => {
      const response = await authApi.register(input);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data);
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiClientError ? err.message : 'Registration failed');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
      setError(null);
    },
  });

  const login = useCallback(
    async (email: string, password: string) => loginMutation.mutateAsync({ email, password }),
    [loginMutation],
  );

  const register = useCallback(
    async (firstName: string, lastName: string, email: string, password: string) =>
      registerMutation.mutateAsync({ firstName, lastName, email, password }),
    [registerMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const refetchUser = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      loading: isLoading || loginMutation.isPending || registerMutation.isPending,
      error,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refetchUser,
    }),
    [user, isLoading, loginMutation.isPending, registerMutation.isPending, error, login, register, logout, refetchUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
