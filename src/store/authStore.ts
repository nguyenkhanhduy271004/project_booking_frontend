import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginResponse } from '../types';
interface AuthState {
  user: {
    id: number; // Added 'id' property
    fullName: string;
    userType: string;
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
interface AuthActions {
  login: (loginResponse: LoginResponse) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  updateUser: (user: User) => void;
  getToken: () => string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
}
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: (loginResponse: LoginResponse) => {
        set({
          user: {
            id: loginResponse.id, // Added 'id' property
            fullName: loginResponse.fullName,
            userType: loginResponse.userType,
          },
          accessToken: loginResponse.accessToken,
          refreshToken: loginResponse.refreshToken,
          isAuthenticated: true,
          error: null,
        });
      },
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      setError: (error: string | null) => {
        set({ error });
      },
      clearError: () => {
        set({ error: null });
      },
      updateUser: (user: User) => {
        set({ 
          user: {
            id: user.id,
            fullName: user.fullName,
            userType: user.userType,
          }
        });
      },
      getToken: () => {
        return get().accessToken;
      },
      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          const oldState = persistedState as any;
          return {
            ...oldState,
            user: oldState.fullName && oldState.userType ? {
              fullName: oldState.fullName,
              userType: oldState.userType,
            } : null,
            fullName: undefined,
            userType: undefined,
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);