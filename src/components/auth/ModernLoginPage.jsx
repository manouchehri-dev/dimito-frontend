'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Wallet, Shield } from 'lucide-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import SSOLoginButton from './SSOLoginButton';
import useAuthStore from '@/stores/useAuthStore';
import LogoutCleanup from './LogoutCleanup';


export default function ModernLoginPage({ redirectTo }) {
    const router = useRouter();
    const locale = useLocale();
    const searchParams = useSearchParams();
    const t = useTranslations('login');
    const authT = useTranslations('auth');
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const { openConnectModal } = useConnectModal();
    const { isConnected } = useAccount();

    // Get tab from URL parameters, default to 'sso'
    const tabFromUrl = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabFromUrl || 'sso');
    const [isWalletConnecting, setIsWalletConnecting] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [initialWalletState] = useState(isConnected);
    const [initialSSOState] = useState(isAuthenticated);
    const [redirectTimeout, setRedirectTimeout] = useState(null);

    // Check if both methods are available
    const hasSSO = isAuthenticated;
    const hasWallet = isConnected;

    // Define redirect destinations
    const getRedirectPath = (redirectParam) => {
        const redirectMap = {
            'transparency': `/transparency/dashboard`,
            'dashboard': `/dashboard`,
            'home': `/`,
            'create-dmt': `/create-dmt`,
        };
        // If redirectParam is a full path, use it directly
        if (redirectParam && redirectParam.startsWith('/')) {
            return redirectParam;
        }

        // Otherwise, use the mapped path or default to home
        return redirectMap[redirectParam] || `/`;
    };


    // Handle NEW authentication success - only redirect on fresh connections
    useEffect(() => {
        // Only redirect if there's a NEW connection (state changed from initial)
        const walletJustConnected = !initialWalletState && isConnected;
        const ssoJustConnected = !initialSSOState && isAuthenticated;

        console.log('🔄 Auth state check:', {
            walletJustConnected,
            ssoJustConnected,
            isConnected,
            isAuthenticated,
            redirectTo,
            isRedirecting
        });

        if (walletJustConnected && !isAuthenticated) {
            // Wallet just connected but no SSO, redirect to intended destination
            console.log('🚀 Wallet connected, redirecting...');

            // Clear force-disconnected flag since user successfully connected
            try {
                localStorage.removeItem('force-disconnected');
                console.log('✅ Cleared force-disconnected flag');
            } catch (error) {
                console.warn('Error clearing force-disconnected flag:', error);
            }

            setIsRedirecting(true);
            const timeout = setTimeout(() => {
                const redirectPath = getRedirectPath(redirectTo);
                console.log('📍 Redirecting to:', redirectPath);
                router.push(redirectPath);
            }, 1000);
            setRedirectTimeout(timeout);
        } else if (ssoJustConnected && !isConnected) {
            // SSO just connected but no wallet, redirect to intended destination
            console.log('🚀 SSO connected, redirecting...');
            setIsRedirecting(true);
            const timeout = setTimeout(() => {
                const redirectPath = getRedirectPath(redirectTo);
                console.log('📍 Redirecting to:', redirectPath);
                router.push(redirectPath);
            }, 1000);
            setRedirectTimeout(timeout);
        } else if ((walletJustConnected || ssoJustConnected) && isConnected && isAuthenticated) {
            // One method just connected and both are now available, redirect immediately
            console.log('🚀 Both methods available, redirecting...');

            // Clear force-disconnected flag since user successfully connected
            if (walletJustConnected) {
                try {
                    localStorage.removeItem('force-disconnected');
                    console.log('✅ Cleared force-disconnected flag (both methods)');
                } catch (error) {
                    console.warn('Error clearing force-disconnected flag:', error);
                }
            }

            setIsRedirecting(true);
            const timeout = setTimeout(() => {
                const redirectPath = getRedirectPath(redirectTo);
                console.log('📍 Redirecting to:', redirectPath);
                router.push(redirectPath);
            }, 500);
            setRedirectTimeout(timeout);
        }
    }, [isConnected, isAuthenticated, initialWalletState, initialSSOState, router, locale, redirectTo]);

    // Update active tab based on available methods
    useEffect(() => {
        if (hasSSO && !hasWallet && activeTab === 'sso') {
            setActiveTab('wallet');
        } else if (hasWallet && !hasSSO && activeTab === 'wallet') {
            setActiveTab('sso');
        }
    }, [hasSSO, hasWallet, activeTab]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (redirectTimeout) {
                clearTimeout(redirectTimeout);
            }
        };
    }, [redirectTimeout]);

    const handleLoginSuccess = () => {
        // Redirect to intended destination after successful login
        const redirectPath = getRedirectPath(redirectTo);
        router.push(redirectPath);
    };


    // Handle wallet connection
    const handleWalletConnect = () => {
        if (openConnectModal) {
            // Clear force-disconnected flag when user manually tries to connect
            try {
                localStorage.removeItem('force-disconnected');
                console.log('🔄 Cleared force-disconnected flag before connection');
            } catch (error) {
                console.warn('Error clearing force-disconnected flag:', error);
            }

            setIsWalletConnecting(true);
            openConnectModal();
        }
    };

    // Reset wallet connecting state when connection changes
    useEffect(() => {
        if (isConnected || !openConnectModal) {
            setIsWalletConnecting(false);
        }
    }, [isConnected, openConnectModal]);

    // Fallback redirect if stuck
    useEffect(() => {
        if (isRedirecting) {
            const fallbackTimeout = setTimeout(() => {
                console.log('⚠️ Fallback redirect triggered');
                const redirectPath = getRedirectPath(redirectTo);
                router.push(redirectPath);
            }, 3000); // 3 second fallback

            return () => clearTimeout(fallbackTimeout);
        }
    }, [isRedirecting, redirectTo, router]);

    // Show loading state when redirecting (only for fresh connections)
    if (isRedirecting) {
        const walletJustConnected = !initialWalletState && isConnected;
        const ssoJustConnected = !initialSSOState && isAuthenticated;

        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4135] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-iransans" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
                        {walletJustConnected && !ssoJustConnected
                            ? (t('walletConnectedRedirecting') || 'Wallet connected! Redirecting...')
                            : ssoJustConnected && !walletJustConnected
                                ? (t('ssoConnectedRedirecting') || 'Login successful! Redirecting...')
                                : (t('redirecting') || 'Redirecting...')
                        }
                    </p>
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
                title: locale === 'fa' ? 'ورود به سیستم' : 'Log in',
                subtitle: locale === 'fa' ? 'وارد حساب کاربری خود شوید' : 'Access your account'
            }
        };

        return contentMap[redirectParam] || contentMap['home'];
    };

    const pageContent = getPageContent(redirectTo);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
            {/* Logout Cleanup Component */}
            <LogoutCleanup />

            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-auto mb-6 flex items-center justify-center">
                        <button
                            onClick={() => router.push(`/`)}
                            className="transition-opacity hover:opacity-80"
                            title={t('backToHome')}
                        >
                            <img
                                src="/logo-header.png"
                                alt="DiMiTo Logo"
                                className="h-12 w-auto object-contain hover:scale-110 transition-transform duration-200"
                            />
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {pageContent.title}
                    </h1>
                    <p className="text-gray-600">
                        {pageContent.subtitle}
                    </p>
                </div>

                {/* Show dashboard navigation if user has any connection */}
                {(hasWallet || hasSSO) && (
                    <div className="mb-4">
                        <button
                            onClick={() => {
                                router.push("/dashboard");
                            }}
                            className="w-full bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white py-3 rounded-lg font-medium hover:from-[#FF4A0F] hover:to-[#FF2A2A] focus:outline-none focus:ring-2 focus:ring-[#FF4135] focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            {locale === 'fa' ? 'ورود به داشبورد' : 'Go to Dashboard'}
                        </button>
                        <div className="text-center mt-3 text-sm text-gray-600">
                            {locale === 'fa' ? 'یا روش دیگری را انتخاب کنید' : 'Or choose another method'}
                        </div>
                    </div>
                )}

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Tab Navigation - Show both methods, highlight connected ones */}
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('sso')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'sso'
                                ? 'text-[#FF4135] border-b-2 border-[#FF4135] bg-orange-50/50'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Shield className="w-4 h-4" />
                                {locale === 'fa' ? 'ورود یکپارچه' : (t('sso') || 'SSO')}
                                {hasSSO && (
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                )}
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('wallet')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'wallet'
                                ? 'text-[#FF4135] border-b-2 border-[#FF4135] bg-orange-50/50'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Wallet className="w-4 h-4" />
                                {t('wallet') || 'Wallet'}
                                {hasWallet && (
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                )}
                            </div>
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">

                        {/* SSO Tab */}
                        {activeTab === 'sso' && (
                            <div className="space-y-4 text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {t('ssoLogin') || 'Single Sign-On'}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {t('ssoLoginDesc') || 'Use your enterprise credentials to sign in'}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <SSOLoginButton
                                        variant="primary"
                                        size="lg"
                                        className="w-full"
                                    />
                                </div>

                                <p className="text-xs text-gray-500" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
                                    {t('secureEasyLogin') || 'Secure and easy login'}
                                </p>
                            </div>
                        )}

                        {/* Wallet Tab */}
                        {activeTab === 'wallet' && (
                            <div className="space-y-4 text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-full flex items-center justify-center mx-auto">
                                    <Wallet className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {t('connectWallet') || 'Connect Wallet'}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {t('connectWalletDesc') || 'Connect your crypto wallet to access your account'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleWalletConnect}
                                    disabled={isWalletConnecting}
                                    className="w-full bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white py-3 rounded-lg font-medium hover:from-[#FF4A0F] hover:to-[#FF2A2A] focus:outline-none focus:ring-2 focus:ring-[#FF4135] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {isWalletConnecting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            {t('connecting') || 'Connecting...'}
                                        </>
                                    ) : (
                                        <>
                                            <Wallet className="w-5 h-5" />
                                            {t('connectWallet') || 'Connect Wallet'}
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-gray-500" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
                                    {locale === 'fa' ? 'اتصال کیف پول شما امن و رمزگذاری شده است' : 'Your wallet connection is secure and encrypted'}
                                </p>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}
