"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
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
  const { isAuthenticated, isLoading, user, accessToken } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give a moment for the auth store to rehydrate from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);

      // If not authenticated after checking, redirect to login
      if (!isAuthenticated || !accessToken) {
        router.push(`/${locale}/transparency/login`);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, accessToken, router, locale]);

  // Show loading while checking authentication
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#FF4135]" />
          <p className="text-gray-600 font-iransans">
            Loading transparency dashboard...
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
        <p className="text-gray-600 font-iransans">Redirecting to login...</p>
      </div>
    </div>
  );
}
