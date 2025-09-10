import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { LoadingSpinner } from '@/components/dashboard/LoadingSpinner';

/**
 * Authentication Guard Component
 * Handles global authentication logic and route protection
 * Should be placed at the app level to protect all routes
 */
export function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/fa/transparency/login',
    '/fa', // Home page
    '/en', // English home page
  ];

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/fa/transparency/dashboard',
    '/fa/transparency/reports',
    '/en/transparency/dashboard',
    '/en/transparency/reports',
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  useEffect(() => {
    // Mark as initialized after first auth check
    if (!isLoading) {
      setIsInitialized(true);
    }
  }, [isLoading]);

  useEffect(() => {
    // Don't redirect while loading or not initialized
    if (isLoading || !isInitialized) return;

    // Handle protected routes
    if (isProtectedRoute && !isAuthenticated) {
      // Redirect to login if trying to access protected route without auth
      router.push('/fa/transparency/login');
      return;
    }

    // Handle login page when already authenticated
    if (pathname === '/fa/transparency/login' && isAuthenticated) {
      // Redirect to dashboard if already logged in
      router.push('/fa/transparency/dashboard');
      return;
    }

  }, [isAuthenticated, isProtectedRoute, pathname, router, isLoading, isInitialized]);

  // Show loading spinner while initializing
  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Render children for all other cases
  return children;
}

/**
 * Route-specific authentication wrapper
 * Use this for specific pages that need custom auth logic
 */
export function PageAuthGuard({ 
  children, 
  requireAuth = false, 
  requireAdmin = false,
  redirectTo = '/fa/transparency/login' 
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check admin requirement
    if (requireAdmin && !isAdmin) {
      router.push('/fa/transparency/dashboard');
      return;
    }

    // All checks passed
    setShouldRender(true);
  }, [isAuthenticated, isLoading, isAdmin, requireAuth, requireAdmin, router, redirectTo]);

  // Show loading while checking
  if (isLoading || (requireAuth && !shouldRender)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return children;
}

/**
 * Authentication status indicator component
 * Shows current auth status for debugging
 */
export function AuthStatusIndicator() {
  const { isAuthenticated, isLoading, user, error } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50">
      <div>Auth: {isAuthenticated ? '✅' : '❌'}</div>
      <div>Loading: {isLoading ? '⏳' : '✅'}</div>
      <div>User: {user?.username || 'None'}</div>
      {error && <div className="text-red-400">Error: {error}</div>}
    </div>
  );
}