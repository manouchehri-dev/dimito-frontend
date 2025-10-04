"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import useAuthStore from "@/stores/useAuthStore";
import { useReporterAccess } from "@/lib/auth/authQueries";
import { Loader2 } from "lucide-react";
import TransparencyDashboard from "./TransparencyDashboard";

/**
 * Authenticated wrapper for Transparency Dashboard
 * Ensures user is logged in before showing the dashboard
 */
export default function AuthenticatedTransparencyDashboard() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("reports");

  // Select each field separately to avoid returning a new object every render
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  // Check reporter access permissions
  const { data: reporterAccess, isLoading: isCheckingAccess, error: accessError } = useReporterAccess();

  const [isChecking, setIsChecking] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Initialize auth from localStorage and wait for hydration
  useEffect(() => {
    initializeAuth();
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      console.log("SSO Auth store hydration completed");
      setHasHydrated(true);
    });

    // Fallback timeout in case onFinishHydration doesn't fire
    const fallbackTimer = setTimeout(() => {
      console.log("Fallback hydration timeout reached");
      setHasHydrated(true);
    }, 1000);

    return () => {
      unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, [initializeAuth]);

  // Memoized redirect path so dependency is stable
  const redirectPath = useMemo(() => `/${locale}/auth/login`, [locale]);

  // Check authentication after hydration and when auth state changes
  useEffect(() => {
    if (!hasHydrated) return;

    const timer = setTimeout(() => {
      setIsChecking(false);

      console.log("SSO Auth check:", {
        isAuthenticated,
        hasToken: !!token,
        hasUser: !!user,
      });

      // If not authenticated after checking, redirect to login
      if (!isAuthenticated || !token) {
        console.log("SSO Auth check failed - redirecting to login");
        router.push(redirectPath);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [hasHydrated, isAuthenticated, token, router, redirectPath]);

  // Show loading while checking authentication, hydrating, or checking access
  if (!hasHydrated || isChecking || isCheckingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-[100px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#FF4135]" />
          <p className="text-gray-600 font-iransans">
            {!hasHydrated ? t("initializing") : t("loadingDashboard")}
          </p>
        </div>
      </div>
    );
  }

  // Show access denied if user doesn't have reporter permissions
  if (accessError?.status === 403 || (reporterAccess && !reporterAccess.hasAccess)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-[100px] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {t("accessDenied") || "Access Denied"}
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {t("reporterAccessDenied") || "You don't have permission to access the transparency dashboard. Please contact an administrator if you believe this is an error."}
          </p>
          <button
            onClick={() => router.push(`/${locale}`)}
            className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4135] hover:to-[#FF2D1B] text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02]"
          >
            {t("goHome") || "Go Home"}
          </button>
        </div>
      </div>
    );
  }

  // Show dashboard if authenticated and has access
  if (isAuthenticated && token && reporterAccess?.hasAccess) {
    console.log("Rendering transparency dashboard for authorized reporter:", reporterAccess);
    return <TransparencyDashboard userRole={reporterAccess.role} permissions={reporterAccess.permissions} />;
  }

  // This shouldn't be reached due to redirect, but just in case
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-[100px] flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 font-iransans">{t("redirectingToLogin")}</p>
      </div>
    </div>
  );
}
