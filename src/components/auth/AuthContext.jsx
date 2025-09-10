import { createContext, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useAuthActions, useAuthStatus } from '@/lib/auth';

// Create the authentication context
const AuthContext = createContext({});

/**
 * Enhanced Authentication Context Provider
 * Provides authentication state and methods throughout the app
 * Handles automatic token refresh and session management
 */
export function AuthContextProvider({ children }) {
  const router = useRouter();
  const { 
    initializeAuth, 
    refreshToken, 
    logout, 
    verifyAuth,
    clearError 
  } = useAuthActions();
  
  const { isAuthenticated, isLoading, error } = useAuthStatus();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  /**
   * Handle automatic token refresh
   */
  const handleTokenRefresh = useCallback(async () => {
    try {
      await refreshToken();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, [refreshToken]);

  /**
   * Handle logout with redirect
   */
  const handleLogout = useCallback(() => {
    logout();
    router.push('/fa/transparency/login');
  }, [logout, router]);

  /**
   * Handle authentication errors
   */
  const handleAuthError = useCallback((error) => {
    console.error('Authentication error:', error);
    
    // If it's a token-related error, try to refresh
    if (error.message?.includes('token') || error.message?.includes('401')) {
      handleTokenRefresh().then((success) => {
        if (!success) {
          handleLogout();
        }
      });
    }
  }, [handleTokenRefresh, handleLogout]);

  /**
   * Verify authentication status periodically
   */
  const handlePeriodicVerification = useCallback(async () => {
    // Get current state directly from store to avoid dependency issues
    const currentState = useAuthStore.getState();
    if (currentState.isAuthenticated && currentState.accessToken) {
      try {
        const isValid = await verifyAuth();
        if (!isValid) {
          handleLogout();
        }
      } catch (error) {
        handleAuthError(error);
      }
    }
  }, [verifyAuth, handleLogout, handleAuthError]);

  // Initialize auth state on mount only
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Set up event listeners
  useEffect(() => {
    // Handle token expiration events from HTTP interceptor
    const handleTokenExpired = () => {
      handleLogout();
    };

    // Handle storage changes (e.g., logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'transparency-auth-storage') {
        initializeAuth();
      }
    };

    // Handle page visibility change (verify auth when page becomes visible)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handlePeriodicVerification();
      }
    };

    // Add event listeners
    window.addEventListener('auth:token-expired', handleTokenExpired);
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleLogout, initializeAuth, handlePeriodicVerification]);

  // Set up periodic verification interval
  useEffect(() => {
    if (isAuthenticated) {
      const verificationInterval = setInterval(handlePeriodicVerification, 5 * 60 * 1000);
      return () => clearInterval(verificationInterval);
    }
  }, [isAuthenticated, handlePeriodicVerification]);

  // Clear errors when authentication state changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000); // Clear error after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Context value with all auth-related data and methods
  const contextValue = {
    // State
    isAuthenticated,
    isLoading,
    error,
    user,
    
    // Methods
    logout: handleLogout,
    refreshToken: handleTokenRefresh,
    clearError,
    
    // Utilities
    isAdmin: user?.is_staff || user?.is_superuser || false,
    userRole: user?.is_superuser ? 'superuser' : user?.is_staff ? 'staff' : 'member',
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 * @returns {Object} Authentication context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
}

/**
 * Hook to get current user information
 * @returns {Object|null} Current user data
 */
export function useCurrentUser() {
  const { user } = useAuth();
  return user;
}

/**
 * Hook to check if user has admin privileges
 * @returns {boolean} Admin status
 */
export function useIsAdmin() {
  const { isAdmin } = useAuth();
  return isAdmin;
}

/**
 * Hook to get user role
 * @returns {string} User role (superuser, staff, member)
 */
export function useUserRole() {
  const { userRole } = useAuth();
  return userRole;
}