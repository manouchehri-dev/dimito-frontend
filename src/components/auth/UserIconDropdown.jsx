'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { User, LogOut, Phone, Mail, ChevronDown, LayoutDashboard, Wallet, Shield } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import useAuthStore from '@/stores/useAuthStore';

export default function UserIconDropdown({ className = "", isMobile = false, showLoginOnly = false, showLogoutOnly = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const t = useTranslations('auth');
  const { user, isAuthenticated, logout, authMethod } = useAuthStore();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const isRTL = useLocale() === "fa"

  // Function to truncate wallet address
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Handle wallet logout
  const handleWalletLogout = () => {
    disconnect();
    setIsOpen(false);
  };

  // Handle wallet connect
  const handleWalletConnect = () => {
    if (openConnectModal) {
      openConnectModal();
      setIsOpen(false);
    }
  };

  // Handle SSO logout
  const handleSSOLogout = async () => {
    try {
      // Import OIDC configuration
      const { generateLogoutUrl } = await import('@/lib/auth/oidcConfig');

      // Generate logout URL - DON'T clear state yet, let provider handle it
      const logoutUrl = generateLogoutUrl({
        postLogoutRedirectUri: `${window.location.origin}/api/auth/sign-out`,
      });

      console.log('Redirecting to OIDC provider logout:', logoutUrl);
      setIsOpen(false);

      // Redirect to OIDC provider logout - cleanup happens after provider confirms
      router.push(logoutUrl);
    } catch (error) {
      console.error('Error during SSO logout:', error);

      // Fallback: clear local state and redirect
      logout();
      sessionStorage.clear();
      setIsOpen(false);
      router.push('/?logout=fallback');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mobile Login Only - Show login/connect buttons at top
  if (isMobile && showLoginOnly) {
    // If neither wallet nor SSO is connected, show single login button
    if (!isConnected && !isAuthenticated) {
      return (
        <div className="w-full">
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white rounded-lg hover:from-[#FF4135] hover:to-[#FF2A2A] transition-all duration-200 font-medium shadow-md"
          >
            <User className="w-5 h-5" />
            <span>{t('login')}</span>
          </button>
        </div>
      );
    }

    // If something is connected, show status
    return (
      <div className="w-full">
        <div className="w-full p-3 bg-green-100 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">
              {isConnected && isAuthenticated
                ? t('walletAndSSOConnected')
                : isConnected
                  ? t('walletConnected')
                  : t('ssoAuthenticated')
              }
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Logout Only - Show logout/disconnect buttons at bottom
  if (isMobile && showLogoutOnly) {
    return (
      <div className="w-full space-y-3">
        {/* Wallet Disconnect */}
        {isConnected && (
          <button
            onClick={handleWalletLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-md"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('disconnectWallet')}</span>
          </button>
        )}

        {/* SSO Logout */}
        {isAuthenticated && (
          <button
            onClick={handleSSOLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-medium shadow-md"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('logout')}</span>
          </button>
        )}

        {/* Nothing to logout message */}
        {!isConnected && !isAuthenticated && (
          <div className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <span className="text-sm">{t('notLoggedIn')}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Don't show login icon if wallet is connected (wallet handles its own UI)
  // Only show SSO login if no wallet connected AND not SSO authenticated
  if (!isConnected && (!isAuthenticated || !user)) {
    return (
      <button
        onClick={() => router.push('/auth/login')}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
        aria-label={t('login')}
        title={t('login')}
      >
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-orange-100 transition-colors duration-200">
          <User className="w-4 h-4 text-gray-600" />
        </div>
        <span className="hidden sm:block text-sm font-medium text-gray-700">
          {t('login')}
        </span>
      </button>
    );
  }

  // Show wallet-only dropdown if wallet connected but not SSO authenticated
  if (isConnected && (!isAuthenticated || !user)) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        {/* Wallet User Button */}
        <div className="relative group">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
            aria-label="Wallet Menu"
            aria-expanded={isOpen}
          >
            {/* Avatar with wallet indicator */}
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-full flex items-center justify-center text-white text-sm font-medium">
                <Wallet className="w-4 h-4" />
              </div>
              {/* Wallet Connected Indicator */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <Wallet className="w-2 h-2 text-white" />
              </div>
            </div>

            {/* Wallet Address (hidden on mobile) */}
            <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-24 mr-1" dir='ltr'>
              {truncateAddress(address)}
            </span>

            {/* Dropdown Arrow */}
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Wallet Status Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>{isRTL ? 'کیف پول متصل است' : 'Wallet Connected'}</span>
            </div>
            <div className="text-xs text-gray-300 mt-1 font-mono">
              {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
            </div>
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>

        {/* Wallet-Only Dropdown Menu */}
        {isOpen && (
          <div className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-[70] overflow-hidden backdrop-blur-sm`}>

            {/* User Info Header */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                    <Wallet className="w-6 h-6" />
                  </div>
                  {/* Wallet Connected Indicator */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                    <Wallet className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate text-end" dir='ltr'>
                    {t('walletUser')}
                  </p>
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-xs text-gray-600">
                      {t('walletConnected')}
                    </p>
                    {/* Wallet Address Display */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-md">
                        <Wallet className="w-3 h-3 text-green-600" />
                        <span className="text-xs font-mono text-green-700">
                          {`${address.slice(0, 6)}...${address.slice(-4)}`}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(address);
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy address"
                      >
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Navigation */}
            <div className="p-3">
              <button
                onClick={() => {
                  router.push('/dashboard');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 rounded-lg transition-all duration-200 group border border-transparent hover:border-blue-200"
              >
                <LayoutDashboard className="w-5 h-5 group-hover:text-blue-600" />
                <span className="flex-1 text-left">{t('dashboard')}</span>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Logout Actions */}
            <div className="p-3 space-y-2 border-t border-gray-100">
              {/* SSO Login */}
              <button
                onClick={async () => {
                  try {
                    const { generateAuthorizationUrl, generatePKCE, generateRandomString } = await import('@/lib/auth/oidcConfig');
                    const { codeVerifier, codeChallenge } = await generatePKCE();
                    const isProduction = process.env.NODE_ENV === 'production';
                    const cookieOptions = [
                      `pkce_code_verifier=${codeVerifier}`,
                      'path=/',
                      'max-age=1800', // 30 minutes
                      'samesite=lax', // Less restrictive than strict
                      ...(isProduction ? ['secure'] : []) // Only secure in production
                    ].join('; ');

                    document.cookie = cookieOptions;
                    const state = generateRandomString(32);
                    sessionStorage.setItem('oauth_state', state);
                    const authUrl = generateAuthorizationUrl({
                      state,
                      codeChallenge,
                      codeChallengeMethod: 'S256'
                    });
                    setIsOpen(false);
                    window.location.href = authUrl;
                  } catch (error) {
                    console.error('Error initiating SSO login:', error);
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 rounded-lg transition-all duration-200 group border border-transparent hover:border-blue-200"
              >
                <Shield className="w-5 h-5 group-hover:text-blue-700" />
                <span className="flex-1 text-left">{isRTL ? 'ورود یکپارچه' : t('loginWithSSO')}</span>
              </button>

              {/* Wallet Disconnect */}
              <button
                onClick={handleWalletLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 rounded-lg transition-all duration-200 group border border-transparent hover:border-red-200"
              >
                <LogOut className="w-5 h-5 group-hover:text-red-700" />
                <span className="flex-1 text-left">{t('disconnectWallet')}</span>
              </button>
            </div>

          </div>
        )}
      </div>
    );
  }

  // Get display name - show phone number if available, otherwise user ID
  const getDisplayName = () => {
    // Use phone number if available, otherwise fall back to user ID
    if (user.phoneNumber) {
      return `+${user.phoneNumber}`;
    } else if (user.firstName) {
      return `${user.firstName}`;
    } else if (user.username) {
      return `+${user.username}`;
    } else if (user.id) {
      return `#${user.id}`;
    }
    else {
      return '#User';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* User Avatar Button */}
      <div className="relative group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
          aria-label="User menu"
          aria-expanded={isOpen}
        >
          {/* Avatar with wallet indicator */}
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-full flex items-center justify-center text-white text-sm font-medium">
              <User className="w-4 h-4" />
            </div>
            {/* Wallet Connected Indicator */}
            {isConnected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <Wallet className="w-2 h-2 text-white" />
              </div>
            )}
          </div>


          {/* Dropdown Arrow */}
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Wallet Status Tooltip */}
        {isConnected && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>{isRTL ? 'کیف پول متصل است' : 'Wallet Connected'}</span>
            </div>
            <div className="text-xs text-gray-300 mt-1 font-mono">
              {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
            </div>
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-[70] overflow-hidden backdrop-blur-sm`} dir={isRTL ? "rtl" : "ltr"}>

          {/* User Info Header */}
          <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                  <User className="w-6 h-6" />
                </div>
                {/* Wallet Connected Indicator */}
                {isConnected && (
                  <div className={`absolute -bottom-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm ${isRTL ? '-left-1' : '-right-1'}`}>
                    <Wallet className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold text-gray-900 truncate ${isRTL ? 'text-right' : 'text-left'}`} dir='ltr'>
                  {getDisplayName()}
                </p>
                <div className="flex flex-col gap-1 mt-1">
                  {/* Wallet Address Display */}
                  {isConnected && address && (
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-md">
                        <Wallet className="w-3 h-3 text-green-600" />
                        <span className="text-xs font-mono text-green-700">
                          {`${address.slice(0, 6)}...${address.slice(-4)}`}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(address);
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy address"
                      >
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Navigation */}
          <div className="p-2 border-b border-gray-100">
            <button
              onClick={() => {
                router.push('/dashboard');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors duration-150 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>{t('dashboard')}</span>
            </button>
          </div>

          {/* Actions */}
          <div className="p-2 space-y-1 border-t border-gray-100">
            {/* SSO Logout */}
            <button
              onClick={handleSSOLogout}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 rounded-lg transition-all duration-200 group border border-transparent hover:border-red-200 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <LogOut className="w-5 h-5 group-hover:text-red-700" />
              <span className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>{authMethod === 'sso' ? t('logout') : 'SSO Logout'}</span>
            </button>

            {/* Wallet Actions - Show disconnect if connected, connect if not */}
            {isConnected ? (
              <button
                onClick={handleWalletLogout}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 hover:text-orange-700 rounded-lg transition-all duration-200 group border border-transparent hover:border-orange-200 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Wallet className="w-5 h-5 group-hover:text-orange-700" />
                <span className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>{t('disconnectWallet')}</span>
              </button>
            ) : (
              <button
                onClick={handleWalletConnect}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 rounded-lg transition-all duration-200 group border border-transparent hover:border-green-200 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Wallet className="w-5 h-5 group-hover:text-green-700" />
                <span className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'اتصال کیف پول' : t('connectWallet')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}