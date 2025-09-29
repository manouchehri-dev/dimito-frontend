'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import useAuthStore from '@/stores/useAuthStore';

/**
 * LogoutCleanup Component
 * 
 * Handles client-side cleanup after OIDC logout.
 * Triggered when ?cleanup=true is present in URL.
 */
export default function LogoutCleanup() {
  const searchParams = useSearchParams();
  const { logout } = useAuthStore();
  
  useEffect(() => {
    const shouldCleanup = searchParams.get('cleanup') === 'true';
    const logoutSuccess = searchParams.get('logout') === 'success';
    
    if (shouldCleanup) {
      console.log('🧹 Starting post-logout cleanup...');
      
      try {
        // 1. Clear Zustand auth store
        logout();
        
        // 2. Clear only SSO-related localStorage items (keep wallet data)
        const ssoKeys = [
          // SSO Auth tokens and user data
          'auth_token',
          'auth_user',
          
          // Zustand SSO persistence (keep wallet-related stores)
          'dimito-auth-storage',
          'transparency-auth-storage',
          
          // OIDC/OAuth specific
          'pkce_code_verifier',
          'oauth_state'
        ];
        
        // Clear specific SSO keys
        ssoKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.warn(`Failed to remove ${key}:`, error);
          }
        });
        
        // 3. Pattern-based cleanup for remaining SSO-related keys only (avoid wallet keys)
        try {
          const allKeys = Object.keys(localStorage);
          const ssoPatterns = [
            'auth_',
            'oidc',
            'oauth',
            'pkce',
            'dimito-auth',
            'transparency-auth'
          ];
          
          // Exclude wallet-related patterns
          const walletPatterns = [
            'wagmi',
            'rainbowkit',
            'rk-',
            'force-disconnected'
          ];
          
          const keysToRemove = allKeys.filter(key => {
            const lowerKey = key.toLowerCase();
            
            // Include if matches SSO patterns
            const matchesSSO = ssoPatterns.some(pattern => 
              lowerKey.includes(pattern.toLowerCase())
            );
            
            // Exclude if matches wallet patterns
            const matchesWallet = walletPatterns.some(pattern => 
              lowerKey.includes(pattern.toLowerCase())
            );
            
            return matchesSSO && !matchesWallet;
          });
          
          keysToRemove.forEach(key => {
            try {
              localStorage.removeItem(key);
            } catch (error) {
              console.warn(`Failed to remove SSO key ${key}:`, error);
            }
          });
          
          console.log(`🧹 Cleaned up ${ssoKeys.length + keysToRemove.length} SSO localStorage items (wallet data preserved)`);
          
        } catch (error) {
          console.warn('Error during pattern-based cleanup:', error);
        }
        
        // 4. Clear SSO-related sessionStorage items only
        try {
          const ssoSessionKeys = [
            'oauth_state',
            'pkce_code_verifier'
          ];
          
          ssoSessionKeys.forEach(key => {
            try {
              sessionStorage.removeItem(key);
            } catch (error) {
              console.warn(`Failed to remove session ${key}:`, error);
            }
          });
          
        } catch (error) {
          console.warn('Error clearing SSO sessionStorage:', error);
        }
        
        console.log('✅ SSO logout cleanup completed successfully (wallet data preserved)');
        
        if (logoutSuccess) {
          console.log('🎉 User successfully logged out');
        }
        
      } catch (error) {
        console.error('❌ Error during logout cleanup:', error);
      }
      
      // Clean up URL parameters after cleanup
      if (typeof window !== 'undefined') {
        const url = new URL(window.location);
        url.searchParams.delete('cleanup');
        
        // Keep logout=success for user feedback
        if (!logoutSuccess) {
          url.searchParams.delete('logout');
        }
        
        // Replace URL without page reload
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [searchParams, logout]);
  
  // This component doesn't render anything
  return null;
}
