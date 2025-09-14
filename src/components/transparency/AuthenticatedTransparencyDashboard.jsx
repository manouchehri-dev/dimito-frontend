"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/auth/authStore";
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
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [isChecking, setIsChecking] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      console.log("Zustand hydration completed");
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
  }, []);

  // Memoized redirect path so dependency is stable
  const redirectPath = useMemo(() => `/${locale}/transparency/login`, [locale]);

  // Check authentication after hydration and when auth state changes
  useEffect(() => {
    if (!hasHydrated) return;

    const timer = setTimeout(() => {
      setIsChecking(false);

      console.log("Auth check:", {
        isAuthenticated,
        hasAccessToken: !!accessToken,
        hasUser: !!user,
      });

      // If not authenticated after checking, redirect to login
      if (!isAuthenticated || !accessToken) {
        console.log("Auth check failed - redirecting to login");
        router.push(redirectPath);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [hasHydrated, isAuthenticated, accessToken, router, redirectPath]);

  // Show loading while checking authentication or hydrating
  if (!hasHydrated || isChecking || isLoading) {
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

  // Show dashboard if authenticated
  if (isAuthenticated && accessToken) {
    console.log("Rendering dashboard for authenticated user");
    return <TransparencyDashboard />;
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
