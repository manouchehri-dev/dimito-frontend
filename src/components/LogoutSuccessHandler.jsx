'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import useAuthStore from '@/stores/useAuthStore';
import toast from 'react-hot-toast';

export default function LogoutSuccessHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('auth');
  const { logout: clearAuthStore } = useAuthStore();
  const hasShownToast = useRef(false);

  useEffect(() => {
    const logout = searchParams.get('logout');
    const cleanup = searchParams.get('cleanup');

    if (logout === 'success' && !hasShownToast.current) {
      // Mark as shown to prevent duplicate in StrictMode
      hasShownToast.current = true;
      
      // Perform cleanup if requested
      if (cleanup === 'true') {
        console.log('🧹 Performing post-logout cleanup...');
        
        // Clear auth store (Zustand state)
        clearAuthStore();
        
        // Clear session storage
        sessionStorage.clear();
        
        // Clear any other auth-related localStorage items
        const authRelatedKeys = [
          'auth-storage',
          'sso_user',
          'access_token',
          'refresh_token',
          'id_token'
        ];
        
        authRelatedKeys.forEach(key => {
          localStorage.removeItem(key);
        });
        
        console.log('✅ Post-logout cleanup completed');
      }
      
      // Show success toast
      toast.success(t('logoutSuccess') || 'Successfully logged out', {
        duration: 4000,
        position: 'top-center',
      });

      // Clean up query parameters from URL
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, router, t, clearAuthStore]);

  return null;
}
