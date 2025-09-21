"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/auth/authStore";
import { Loader2 } from "lucide-react";
import TransparencyMainPage from "./TransparencyMainPage";

/**
 * Authenticated wrapper for Transparency Main Page
 * Ensures user is logged in before showing the main page
 */
export default function AuthenticatedTransparencyMainPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("reports");

  // Stable selectors
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [isChecking, setIsChecking] = useState(true);

  const redirectPath = useMemo(() => `/${locale}/transparency/login`, [locale]);

  const didCheckRef = useRef(false);
  useEffect(() => {
    if (didCheckRef.current) return;
    didCheckRef.current = true;

    const timer = setTimeout(() => {
      setIsChecking(false);

      const { isAuthenticated: authed, accessToken: token } =
        useAuthStore.getState();
      if (!authed || !token) {
        router.push(redirectPath);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router, redirectPath]);

  // Show loading while checking authentication
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#FF4135]" />
          <p className="text-gray-600 font-iransans">
            {t("loadingTransparencyDashboard")}
          </p>
        </div>
      </div>
    );
  }

  // Show main page if authenticated
  if (isAuthenticated && accessToken) {
    return <TransparencyMainPage />;
  }

  // This shouldn't be reached due to redirect, but just in case
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 font-iransans">{t("redirectingToLogin")}</p>
      </div>
    </div>
  );
}
