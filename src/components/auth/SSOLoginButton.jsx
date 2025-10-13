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

      // Get the original domain and locale to encode in state parameter
      const originalDomain = window.location.host;
      const currentLocale = window.location.pathname.split('/')[1]; // Extract locale from URL (e.g., '/fa/...')
      const locale = (currentLocale === 'fa' || currentLocale === 'en') ? currentLocale : 'en';
      
      console.log('🌐 Original domain:', originalDomain);
      console.log('🗣️  Current locale:', locale);

      // Generate PKCE for enhanced security (required for public clients)
      const { codeVerifier, codeChallenge } = await generatePKCE();

      // Store code verifier in cookie (will work on same domain)
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = [
        `pkce_code_verifier=${codeVerifier}`,
        'path=/',
        'max-age=1800', // 30 minutes
        'samesite=lax',
        ...(isProduction ? ['secure'] : [])
      ].join('; ');
      
      document.cookie = cookieOptions;
      console.log('🍪 Stored PKCE verifier in cookie');

      // Generate state for CSRF protection and encode domain + locale
      // Format: randomString.base64(domain|locale)
      // Using pipe separator because domain may contain colon (localhost:3000)
      const stateRandom = generateRandomString(32);
      const stateData = `${originalDomain}|${locale}`;
      const stateDataEncoded = btoa(stateData);
      const state = `${stateRandom}.${stateDataEncoded}`;
      
      console.log('🔐 State with encoded domain and locale:', { 
        stateRandom, 
        stateDataEncoded, 
        originalDomain, 
        locale,
        decoded: stateData 
      });

      // Generate authorization URL with PKCE and state containing domain
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
