'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
}

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  /**
   * Fetch current user session
   */
  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        setAuthState({ user: null, loading: false, error: null });
        return;
      }

      const data = await response.json();

      if (data.success && data.data.user) {
        setAuthState({
          user: data.data.user,
          loading: false,
          error: null,
        });
      } else {
        setAuthState({ user: null, loading: false, error: null });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setAuthState({ user: null, loading: false, error: 'Error al cargar sesión' });
    }
  }, []);

  /**
   * Login user
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: data.error?.message || 'Error al iniciar sesión',
        }));
        return false;
      }

      setAuthState({
        user: data.data.user,
        loading: false,
        error: null,
      });

      // Redirect based on role
      const dashboardUrl = data.data.user.role === 'ADMIN' ? '/admin' : '/tenant';
      router.push(dashboardUrl);
      router.refresh();

      return true;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: 'Error de conexión',
      }));
      return false;
    }
  };

  /**
   * Register new user
   */
  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: data.error?.message || 'Error al registrarse',
        }));
        return false;
      }

      setAuthState({
        user: data.data.user,
        loading: false,
        error: null,
      });

      // Redirect based on role
      const dashboardUrl = data.data.user.role === 'ADMIN' ? '/admin' : '/tenant';
      router.push(dashboardUrl);
      router.refresh();

      return true;
    } catch (error) {
      console.error('Register error:', error);
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: 'Error de conexión',
      }));
      return false;
    }
  };

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setAuthState({ user: null, loading: false, error: null });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setAuthState({ user: null, loading: false, error: null });
      router.push('/login');
    }
  };

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => {
    return authState.user?.role === UserRole.ADMIN;
  };

  /**
   * Check if user is tenant
   */
  const isTenant = (): boolean => {
    return authState.user?.role === UserRole.TENANT;
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = (): boolean => {
    return authState.user !== null;
  };

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    register,
    logout,
    isAdmin,
    isTenant,
    isAuthenticated,
    refetch: fetchUser,
  };
}
