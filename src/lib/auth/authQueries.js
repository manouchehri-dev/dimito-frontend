import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useAuthStore,
  useAuthActions,
  useAuthStatus,
  useAuthUser,
} from "./authStore";

// Query keys for React Query
export const authKeys = {
  all: ["auth"],
  user: () => [...authKeys.all, "user"],
  verify: () => [...authKeys.all, "verify"],
};

/**
 * Hook for user login mutation (uses Zustand store)
 * @returns {Object} Mutation object with login function and states
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials) => login(credentials),
    onSuccess: (data) => {
      // Update user query cache
      queryClient.setQueryData(authKeys.user(), data.user);
      // Invalidate and refetch any auth-related queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: () => {
      // Clear any cached auth data on login failure
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}

/**
 * Hook for user logout mutation (uses Zustand store)
 * @returns {Object} Mutation object with logout function
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => {
      logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear all auth-related queries from cache
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.clear();
    },
  });
}

/**
 * Hook for token refresh mutation (uses Zustand store)
 * @returns {Object} Mutation object with refresh function
 */
export function useRefreshToken() {
  const queryClient = useQueryClient();
  const refreshToken = useAuthStore((state) => state.refreshToken);

  return useMutation({
    mutationFn: () => refreshToken(),
    onSuccess: () => {
      // Invalidate auth queries to trigger refetch with new token
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: () => {
      // Clear auth data if refresh fails - handled by Zustand store
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}

/**
 * Hook to get current user data (uses Zustand store)
 * @returns {Object} Query object with user data and states
 */
export function useCurrentUser() {
  const user = useAuthUser();
  const { isAuthenticated } = useAuthStatus();

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => {
      if (!user) {
        throw new Error("No user data available");
      }
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    initialData: user,
  });
}

/**
 * Hook to verify token validity (uses Zustand store)
 * @returns {Object} Query object with verification status
 */
export function useVerifyToken() {
  const verifyAuth = useAuthStore((state) => state.verifyAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: authKeys.verify(),
    queryFn: () => verifyAuth(),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to check authentication status (uses Zustand store directly)
 * @returns {Object} Authentication status and user data
 */
export function useAuth() {
  const user = useAuthUser();
  const { isAuthenticated, isLoading, error } = useAuthStatus();
  const verifyQuery = useVerifyToken();

  return {
    isAuthenticated: isAuthenticated && !verifyQuery.isError,
    user,
    isLoading: isLoading || verifyQuery.isLoading,
    error: error || verifyQuery.error,
    isVerifying: verifyQuery.isFetching,
  };
}
