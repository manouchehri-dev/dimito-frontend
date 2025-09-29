'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LogIn, Loader2 } from 'lucide-react';

export default function SSOLoginButton({
  className = "",
  variant = "primary", // primary, secondary, outline
  size = "default" // default, sm, lg
}) {
  const t = useTranslations('auth');
  const [isLoading, setIsLoading] = useState(false);

  const handleSSOLogin = async () => {
    setIsLoading(true);

    try {
      // Import OIDC configuration
      const { generateAuthorizationUrl, generatePKCE, generateRandomString } = await import('@/lib/auth/oidcConfig');

      // Generate PKCE for enhanced security (required for public clients)
      const { codeVerifier, codeChallenge } = await generatePKCE();

      // Store code verifier in cookie (accessible to API route)
      document.cookie = `pkce_code_verifier=${codeVerifier}; path=/; max-age=600; secure; samesite=strict`;

      // Generate state for CSRF protection
      const state = generateRandomString(32);
      sessionStorage.setItem('oauth_state', state);

      // Generate authorization URL with PKCE
      const authUrl = generateAuthorizationUrl({
        state,
        codeChallenge,
        codeChallengeMethod: 'S256'
      });

      // Redirect to OIDC provider
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating SSO login:', error);
      setIsLoading(false);
      // You could show an error toast here
    }
  };

  // Button styling variants
  const variants = {
    primary: "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4A0F] hover:to-[#FF2A2A] text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900",
    outline: "border-2 border-[#FF5D1B] text-[#FF5D1B] hover:bg-[#FF5D1B]/10 hover:border-[#FF363E] hover:text-[#FF363E]"
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      onClick={handleSSOLogin}
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
        <LogIn className="w-4 h-4" />
      )}
      {isLoading ? t('loggingIn') : t('loginWithSSO')}
    </button>
  );
}
