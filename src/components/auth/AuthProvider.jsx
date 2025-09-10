import { createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useAuthActions } from '@/lib/auth';

// Create context for auth-related utilities
const AuthContext = createContext({});

/**
 * Authentication Provider Component
 * Initializes auth state and handles global auth events
 * Uses Zustand store for state management
 */
export function AuthProvider({ children }) {
  const router = useRouter();
  const { initializeAuth } = useAuthActions();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Initialize auth state on app start
    initializeAuth();

    // Listen for token expiration events
    const handleTokenExpired = () => {
      // Redirect to login page when token expires
      router.push('/fa/transparency/login');
    };

    // Listen for auth state changes
    const handleStorageChange = (e) => {
      if (e.key === 'transparency-auth-storage') {
        // Re-initialize auth state when storage changes
        initializeAuth();
      }
    };

    // Add event listeners
    window.addEventListener('auth:token-expired', handleTokenExpired);
    window.addEventListener('storage', handleStorageChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initializeAuth, router]);

  // Context value with auth utilities
  const contextValue = {
    isAuthenticated,
    // Add any additional auth utilities here if needed
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 * @returns {Object} Auth context value
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

/**
 * Higher-order component to wrap components with auth provider
 * @param {React.Component} Component - Component to wrap
 * @returns {React.Component} Wrapped component
 */
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    return (
      <AuthProvider>
        <Component {...props} />
      </AuthProvider>
    );
  };
}