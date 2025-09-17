"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import TransparencyLoginForm from "@/components/transparency/TransparencyLoginForm";
import { useAuthStore } from "@/lib/auth/authStore";

export default function UnifiedLoginPage({ redirectTo }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("login");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Define redirect destinations
  const getRedirectPath = (redirectParam) => {
    const redirectMap = {
      'transparency': `/${locale}/transparency/dashboard`,
      'dashboard': `/${locale}/dashboard`,
      'home': `/${locale}`,
      'create-dmt': `/${locale}/create-dmt`,
    };

    // If redirectParam is a full path, use it directly
    if (redirectParam && redirectParam.startsWith('/')) {
      return redirectParam;
    }

    // Otherwise, use the mapped path or default to transparency dashboard
    return redirectMap[redirectParam] || `/${locale}`;
  };

  // Redirect authenticated users to their intended destination
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = getRedirectPath(redirectTo);
      router.push(redirectPath);
    }
  }, [isAuthenticated, router, locale, redirectTo]);

  const handleLoginSuccess = () => {
    // Redirect to intended destination after successful login
    const redirectPath = getRedirectPath(redirectTo);
    router.push(redirectPath);
  };

  // Don't render login form if user is already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4135] mx-auto mb-4"></div>
          <p className="text-gray-600 font-iransans">{t("redirecting") || "Redirecting..."}</p>
        </div>
      </div>
    );
  }

  // Get dynamic title and subtitle based on redirect destination
  const getPageContent = (redirectParam) => {
    const contentMap = {
      'transparency': {
        title: locale === 'fa' ? 'ورود به داشبورد شفافیت' : 'Transparency Dashboard Login',
        subtitle: locale === 'fa' ? 'برای مشاهده گزارش‌ها و داده‌های شفافیت وارد شوید' : 'Access transparency reports and data'
      },
      'dashboard': {
        title: locale === 'fa' ? 'ورود به داشبورد' : 'Dashboard Login',
        subtitle: locale === 'fa' ? 'وارد داشبورد خود شوید' : 'Access your personal dashboard'
      },
      'create-dmt': {
        title: locale === 'fa' ? 'ورود برای ایجاد DMT' : 'Login to Create DMT',
        subtitle: locale === 'fa' ? 'برای ایجاد توکن DMT وارد شوید' : 'Sign in to create DMT tokens'
      },
      'home': {
        title: locale === 'fa' ? 'ورود به سیستم' : 'Sign In',
        subtitle: locale === 'fa' ? 'وارد حساب کاربری خود شوید' : 'Access your account'
      }
    };

    return contentMap[redirectParam] || contentMap['home'];
  };

  const pageContent = getPageContent(redirectTo);

  return (
    <div className="min-h-screen bg-[#F5F5F5] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#FF5D1B]/10 to-[#FF363E]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#FF363E]/10 to-[#FF5D1B]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-[#2D2D2D]/5 to-transparent rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="mx-auto h-20 w-auto mb-8 flex items-center justify-center">
              <img
                src="/logo-header.png"
                alt="DiMiTo Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] font-iransans">
                {pageContent.title}
              </h1>
              <p className="text-base text-gray-600 font-iransans max-w-sm mx-auto">
                {pageContent.subtitle}
              </p>
            </div>
          </div>

          {/* Login Form */}
          <TransparencyLoginForm onSuccess={handleLoginSuccess} />

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-500 font-iransans">
              © 2024 DiMiTo. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}