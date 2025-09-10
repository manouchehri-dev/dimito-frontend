import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { LoadingSpinner } from '@/components/dashboard/LoadingSpinner';

/**
 * Protected Route Component
 * Protects routes that require authentication
 * Redirects unauthenticated users to login page
 */
export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  fallback = <LoadingSpinner />,
  redirectTo = '/fa/transparency/login'
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Redirect if admin access required but user is not admin
    if (requireAdmin && !isAdmin) {
      router.push('/fa/transparency/dashboard'); // Redirect to regular dashboard
      return;
    }
  }, [isAuthenticated, isLoading, isAdmin, requireAdmin, router, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    return fallback;
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return fallback;
  }

  // Don't render if admin required but user is not admin
  if (requireAdmin && !isAdmin) {
    return fallback;
  }

  // Render children if authenticated and authorized
  return children;
}

/**
 * Higher-order component to protect routes
 * @param {React.Component} Component - Component to protect
 * @param {Object} options - Protection options
 * @returns {React.Component} Protected component
 */
export function withProtectedRoute(Component, options = {}) {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Component to show when user lacks required permissions
 */
export function UnauthorizedAccess({ 
  message = "You don't have permission to access this page.",
  showBackButton = true 
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        {showBackButton && (
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Role-based access control component
 * Shows different content based on user role
 */
export function RoleBasedAccess({ 
  children, 
  allowedRoles = [], 
  fallback = <UnauthorizedAccess /> 
}) {
  const { user, userRole } = useAuth();

  // Check if user has required role
  const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(userRole);

  if (!hasAccess) {
    return fallback;
  }

  return children;
}