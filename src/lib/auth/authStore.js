import { create } from "zustand";
import { shallow } from "zustand/shallow";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService } from "./authService";

/**
 * Zustand store for authentication state management
 * Includes persistence to localStorage and automatic token management
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      /**
       * Set authentication data after successful login
       * @param {Object} authData - Authentication response data
       */
      setAuth: (authData) => {
        const { user, access, refresh } = authData;
        set({
          user,
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
          error: null,
        });
      },

      /**
       * Update access token (used during token refresh)
       * @param {string} token - New access token
       */
      setAccessToken: (token) => set({ accessToken: token }),

      /**
       * Clear all authentication data (logout)
       */
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        }),

      /**
       * Login action with error handling
       * @param {Object} credentials - Login credentials
       */
      login: async (credentials) => {
        const { setLoading, setAuth, setError } = get();

        try {
          setLoading(true);
          setError(null);

          const authData = await authService.login(credentials);
          setAuth(authData);

          return authData;
        } catch (error) {
          setError(error.message);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      /**
       * Logout action
       */
      logout: () => {
        const { clearAuth } = get();
        authService.logout();
        clearAuth();
      },

      /**
       * Refresh token action
       */
      refreshToken: async () => {
        const {
          refreshToken: currentRefreshToken,
          setAccessToken,
          clearAuth,
        } = get();

        if (!currentRefreshToken) {
          clearAuth();
          throw new Error("No refresh token available");
        }

        try {
          const newAccessToken = await authService.refreshToken(
            currentRefreshToken
          );
          setAccessToken(newAccessToken);
          return newAccessToken;
        } catch (error) {
          clearAuth();
          throw error;
        }
      },

      /**
       * Verify current authentication status
       */
      verifyAuth: async () => {
        const { accessToken, user, clearAuth } = get();

        if (!accessToken || !user) {
          clearAuth();
          return false;
        }

        try {
          const isValid = await authService.verifyToken(accessToken);
          if (!isValid) {
            clearAuth();
            return false;
          }
          return true;
        } catch (error) {
          clearAuth();
          return false;
        }
      },

      /**
       * Initialize auth state from storage
       */
      initializeAuth: () => {
        const { user, accessToken, refreshToken } = get();

        console.log("Initializing auth state:", {
          hasUser: !!user,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        });

        if (user && accessToken && refreshToken) {
          set({ isAuthenticated: true });
          console.log("Auth state initialized - user is authenticated");

          // Verify token validity in background
          get()
            .verifyAuth()
            .catch((error) => {
              console.error("Token verification failed:", error);
            });
        } else {
          console.log("Auth state not initialized - missing required data");
          set({ isAuthenticated: false });
        }
      },
    }),
    {
      name: "dimito-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize auth state after rehydration
        if (state) {
          console.log("Auth store rehydrated:", {
            hasUser: !!state.user,
            hasAccessToken: !!state.accessToken,
            hasRefreshToken: !!state.refreshToken,
          });
          state.initializeAuth();
        }
      },
    }
  )
);

/**
 * Selector hooks for specific auth state
 */
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthTokens = () =>
  useAuthStore(
    (state) => ({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
    }),
    shallow
  );
export const useAuthStatus = () =>
  useAuthStore(
    (state) => ({
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
    }),
    shallow
  );

/**
 * Action hooks for auth operations
 */
export const useAuthActions = () =>
  useAuthStore(
    (state) => ({
      login: state.login,
      logout: state.logout,
      refreshToken: state.refreshToken,
      verifyAuth: state.verifyAuth,
      setError: state.setError,
      clearError: state.clearError,
    }),
    shallow
  );
