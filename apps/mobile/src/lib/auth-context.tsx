import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { setOnAuthCleared } from '@/lib/api/client';
import { authApi } from '@/lib/api/endpoints';
import {
  clearTokens,
  loadTokens,
  loadUserJson,
  saveTokens,
  saveUserJson,
} from '@/lib/storage';
import type { AuthPayload, User } from '@/lib/types';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithPayload: (payload: AuthPayload) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: (user: User) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 15_000,
    },
  },
});

function AuthProviderInner({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(async () => {
    await clearTokens();
    setUser(null);
    queryClient.clear();
  }, []);

  useEffect(() => {
    setOnAuthCleared(() => {
      setUser(null);
      queryClient.clear();
    });
    return () => setOnAuthCleared(null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { accessToken, refreshToken } = await loadTokens();
        const savedUser = await loadUserJson();
        if (accessToken && refreshToken && savedUser) {
          setUser(JSON.parse(savedUser) as User);
        } else if (refreshToken) {
          const tokens = await authApi.refresh(refreshToken);
          await saveTokens(tokens.accessToken, tokens.refreshToken);
          if (savedUser) setUser(JSON.parse(savedUser) as User);
        } else {
          await clearTokens();
        }
      } catch {
        await clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signInWithPayload = useCallback(async (payload: AuthPayload) => {
    await saveTokens(payload.accessToken, payload.refreshToken);
    await saveUserJson(JSON.stringify(payload.user));
    setUser(payload.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const payload = await authApi.login({ email, password });
      await signInWithPayload(payload);
    },
    [signInWithPayload],
  );

  const signup = useCallback(
    async (email: string, password: string, confirmPassword: string) => {
      const payload = await authApi.signup({
        email,
        password,
        confirmPassword,
        agreementAccepted: 'true',
      });
      await signInWithPayload(payload);
    },
    [signInWithPayload],
  );

  const logout = useCallback(async () => {
    try {
      const { refreshToken } = await loadTokens();
      await authApi.logout(refreshToken);
    } catch {
      // still clear local session
    } finally {
      await clearSession();
    }
  }, [clearSession]);

  const refreshUser = useCallback(async (next: User) => {
    await saveUserJson(JSON.stringify(next));
    setUser(next);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      signInWithPayload,
      login,
      signup,
      logout,
      refreshUser,
    }),
    [user, isLoading, signInWithPayload, login, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </QueryClientProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AppProviders');
  return ctx;
}
