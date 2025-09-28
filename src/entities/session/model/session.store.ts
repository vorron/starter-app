import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { User } from "@/entities/user/model/types";
import { authApi } from "@/shared/api/endpoints/auth";
import { AppError, toAppError } from "@/shared/lib/errors";

interface SessionState {
  user: User | null;
  isLoading: boolean;
  error: AppError | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useSessionStore = create<SessionState>()(
  devtools(
    (set) => ({
      user: null,
      isLoading: true,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const userData = await authApi.login({ email, password });
          set({ user: userData, isLoading: false, error: null });
        } catch (error) {
          const appError = toAppError(error);
          set({ isLoading: false, error: appError });
          throw appError;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const userData = await authApi.register({ email, password, name });
          set({ user: userData, isLoading: false, error: null });
        } catch (error) {
          const appError = toAppError(error);
          set({ isLoading: false, error: appError });
          throw appError;
        }
      },

      checkAuth: async () => {
        try {
          const userData = await authApi.getMe();
          set({ user: userData, isLoading: false, error: null });
        } catch (error) {
          const appError = toAppError(error);
          set({ user: null, isLoading: false, error: appError });
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({ user: null, isLoading: false, error: null });
        }
      },

      clearError: () => set({ error: null }),
      
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
      })),
    }),
    { name: "session-store" }
  )
);

export const useUser = () => useSessionStore((state) => state.user);
export const useAuthLoading = () => useSessionStore((state) => state.isLoading);
export const useAuthError = () => useSessionStore((state) => state.error);
export const useAuthActions = () => useSessionStore((state) => ({
  login: state.login,
  logout: state.logout,
  register: state.register,
  checkAuth: state.checkAuth,
  clearError: state.clearError,
}));