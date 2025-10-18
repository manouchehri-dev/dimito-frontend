'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';
import useAuthStore from '@/stores/useAuthStore';
import toast from 'react-hot-toast';

export default function SSOLogoutButton({
  className = "",
  variant = "outline", // primary, secondary, outline
  size = "default" // default, sm, lg
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { logout, authMethod } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('auth');

  const handleSSOLogout = async () => {
    setIsLoading(true);

    try {
      // Show loading toast
      const loadingToast = toast.loading(t('loggingOut') || 'Logging out...');
      
      // Import OIDC configuration
      const { generateLogoutUrl } = await import('@/lib/auth/oidcConfig');

      // Generate logout URL - DON'T clear state yet, let provider handle it
      const logoutUrl = generateLogoutUrl({
        postLogoutRedirectUri: `${window.location.origin}/api/auth/sign-out`,
      });

      console.log('Redirecting to OIDC provider logout:', logoutUrl);
      toast.dismiss(loadingToast);

      // Redirect to OIDC provider logout - cleanup happens after provider confirms
      window.location.href = logoutUrl;
    } catch (error) {
      console.error('Error during SSO logout:', error);
      toast.error(t('logoutFailed') || 'Logout failed. Please try again.');
      setIsLoading(false);

      // Fallback: clear local state and redirect to home with hard refresh
      logout();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  // Only show for SSO authenticated users
  if (authMethod !== 'sso') {
    return null;
  }

  // Button styling variants
  const variants = {
    primary: "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4A0F] hover:to-[#FF2A2A] text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900",
    outline: "border-2 border-[#FF363E] text-[#FF363E] hover:bg-[#FF363E]/10 hover:border-[#FF2A2A] hover:text-[#FF2A2A]"
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      onClick={handleSSOLogout}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center gap-2 
        font-medium rounded-lg transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      {isLoading ? t('loggingOut') : t('logoutSuccess')}
    </button>
  );
}
