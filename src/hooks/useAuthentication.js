import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { useLogin, useLogout } from "@/lib/auth";

/**
 * Comprehensive authentication hook
 * Provides all authentication functionality in one place
 * Combines Zustand store, React Query, and Context
 */
export function useAuthentication() {
  const router = useRouter();
  const authContext = useAuth();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  /**
   * Login with credentials
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.username - Username
   * @param {string} credentials.password - Password
   * @param {string} redirectTo - Redirect path after successful login
   */
  const login = useCallback(
    async (credentials, redirectTo = "/fa/transparency/dashboard") => {
      try {
        const result = await loginMutation.mutateAsync(credentials);

        // Redirect after successful login
        router.push(redirectTo);

        return result;
      } catch (error) {
        throw error;
      }
    },
    [loginMutation, router]
  );

  /**
   * Logout user
   * @param {string} redirectTo - Redirect path after logout
   */
  const logout = useCallback(
    async (redirectTo = "/fa/transparency/login") => {
      try {
        await logoutMutation.mutateAsync();
        router.push(redirectTo);
      } catch (error) {
        // Even if logout fails, redirect to login
        router.push(redirectTo);
      }
    },
    [logoutMutation, router]
  );

  /**
   * Check if user has specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean} Permission status
   */
  const hasPermission = useCallback(
    (permission) => {
      const { user } = authContext;
      if (!user) return false;

      switch (permission) {
        case "admin":
          return user.is_staff || user.is_superuser;
        case "superuser":
          return user.is_superuser;
        case "staff":
          return user.is_staff;
        default:
          return true; // Default permission for authenticated users
      }
    },
    [authContext]
  );

  /**
   * Get user display name
   * @returns {string} User display name
   */
  const getUserDisplayName = useCallback(() => {
    const { user } = authContext;
    if (!user) return "";

    if (user.first_name || user.last_name) {
      return `${user.first_name} ${user.last_name}`.trim();
    }

    return user.username || user.email || "User";
  }, [authContext]);

  /**
   * Check if user can access transparency features
   * @returns {boolean} Access status
   */
  const canAccessTransparency = useCallback(() => {
    return authContext.isAuthenticated;
  }, [authContext.isAuthenticated]);

  /**
   * Get authentication status summary
   * @returns {Object} Auth status summary
   */
  const getAuthStatus = useCallback(() => {
    return {
      isAuthenticated: authContext.isAuthenticated,
      isLoading:
        authContext.isLoading ||
        loginMutation.isPending ||
        logoutMutation.isPending,
      error: authContext.error || loginMutation.error || logoutMutation.error,
      user: authContext.user,
      userRole: authContext.userRole,
      isAdmin: authContext.isAdmin,
    };
  }, [authContext, loginMutation, logoutMutation]);

  return {
    // State
    ...getAuthStatus(),

    // Actions
    login,
    logout,

    // Utilities
    hasPermission,
    getUserDisplayName,
    canAccessTransparency,
    getAuthStatus,

    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,

    // Methods to reset errors
    resetLoginError: loginMutation.reset,
    resetLogoutError: logoutMutation.reset,
  };
}

/**
 * Hook for login form functionality
 * Simplified hook specifically for login forms
 */
export function useLoginForm() {
  const { login, isLoggingIn, loginError, resetLoginError } =
    useAuthentication();

  return {
    login,
    isLoading: isLoggingIn,
    error: loginError,
    clearError: resetLoginError,
  };
}

/**
 * Hook for logout functionality
 * Simplified hook for logout buttons/menus
 */
export function useLogoutAction() {
  const { logout, isLoggingOut, logoutError } = useAuthentication();

  return {
    logout,
    isLoading: isLoggingOut,
    error: logoutError,
  };
}
