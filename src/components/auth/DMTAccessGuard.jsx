"use client";

import { useRouter } from "@/i18n/navigation";
import { useDMTAccess } from "@/lib/auth/authQueries";
import { useTranslations } from "next-intl";
import { useLogout } from "@/lib/auth/authQueries";
/**
 * DMT Access Guard Component
 * Checks if user has permission to create DMT tokens
 */
export default function DMTAccessGuard({ children, fallback = null }) {
  const t = useTranslations("createDMT");
  const router = useRouter()
  const { data: hasAccess, isLoading, error } = useDMTAccess();


  const handleBack = () => {
      router.push("/")
  };

  // Show loading state while checking access
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4135] mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-primary mb-2">
            {t("checkingAccess") || "Checking Access..."}
          </h2>
          <p className="text-gray-600">
            {t("verifyingPermissions") || "Verifying your permissions to create DMT tokens"}
          </p>
        </div>
      </div>
    );
  }

  // Show access denied message
  if (error?.status === 403 || hasAccess === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
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
            {t("accessDeniedMessage") || "You don't have permission to create DMT tokens. Please contact an administrator if you believe this is an error."}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleBack}
              className="block w-full bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4135] hover:to-[#FF2D1B] text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              {t("goBack") || "Go Back"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error message for other errors
  if (error && error.status !== 403) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">
            {t("errorCheckingAccess") || "Error Checking Access"}
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {t("errorCheckingAccessMessage") || "We couldn't verify your permissions right now. Please try again."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4135] hover:to-[#FF2D1B] text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02]"
          >
            {t("tryAgain") || "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  // User has access, render the protected content
  if (hasAccess === true) {
    return children;
  }

  // Fallback loading state
  return fallback || (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4135]"></div>
    </div>
  );
}