'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import useAuthStore from '@/stores/useAuthStore';

export default function LogoutHandler() {
  const searchParams = useSearchParams();
  const { logout } = useAuthStore();

  useEffect(() => {
    // Check if this is a logout callback with cleanup flag
    const isLogoutCallback = searchParams.get('logout') === 'success';
    const shouldCleanup = searchParams.get('cleanup') === 'true';

    if (isLogoutCallback && shouldCleanup) {
      console.log('🧹 Performing post-logout cleanup after provider confirmation');
      
      // Clear local auth state
      logout();
      
      // Clear all session storage
      sessionStorage.clear();
      
      // Clear all auth-related cookies on client side
      document.cookie = 'pkce_code_verifier=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      console.log('✅ Logout cleanup completed');
      
      // Clean up URL parameters
      const url = new URL(window.location);
      url.searchParams.delete('logout');
      url.searchParams.delete('cleanup');
      window.history.replaceState({}, '', url);
    }
  }, [searchParams, logout]);

  return null; // This component doesn't render anything
}
