"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import useAuthStore from "@/stores/useAuthStore";
import { getLoginUrl } from "@/lib/auth/loginUtils";

/**
 * Protected Route Component
 * Redirects unauthenticated users to login with current path as redirect
 */
export default function ProtectedRoute({
  children,
  redirectTo = null, // Custom redirect destination
  fallback = null // Custom loading/redirect component
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("common");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  // Initialize auth from localStorage on component mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  
  useEffect(() => {
    if (!isAuthenticated) {
      // Use custom redirect or current path
      const redirect = redirectTo || pathname;
      const loginUrl = getLoginUrl(redirect, locale);
      router.push(loginUrl);
    }
  }, [isAuthenticated, router, pathname, locale, redirectTo]);

  // Show loading state while redirecting (if not authenticated)
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4135] mx-auto mb-4"></div>
          <p className="text-gray-600 font-iransans">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // Render protected content
  return children;
}
