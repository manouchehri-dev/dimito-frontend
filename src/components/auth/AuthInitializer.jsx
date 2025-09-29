'use client';

import { useEffect } from 'react';
import useAuthStore from '@/stores/useAuthStore';

export default function AuthInitializer() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from stored token on app load
    initializeAuth();
  }, [initializeAuth]);

  // This component doesn't render anything
  return null;
}
