"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAccount } from "wagmi";
import useAuthStore from "@/stores/useAuthStore";
import { Wallet, User, RefreshCw } from "lucide-react";

// Dashboard content components
import WalletDashboardContent from "./WalletDashboardContent";
import SSODashboardContent from "./SSODashboardContent";
import DashboardLoadingSpinner from "./DashboardLoadingSpinner";

export default function TabbedDashboard() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, isConnected } = useAccount();
  const { isAuthenticated, authMethod, user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for auth store to hydrate (especially important after SSO redirect)
  useEffect(() => {
    // Give auth store time to hydrate from localStorage
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100); // Small delay to ensure Zustand persist has loaded
    
    return () => clearTimeout(timer);
  }, []);

  // Get active tab from URL params, with smart defaults
  const [activeTab, setActiveTab] = useState(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab) return urlTab;

    // Smart default: prefer wallet if connected, otherwise SSO if authenticated
    if (isConnected && address) return 'wallet';
    if (isAuthenticated && authMethod === 'sso') return 'sso';
    return 'wallet'; // fallback
  });

  // Update URL when tab changes
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams);
    params.set('tab', newTab);

    // Add wallet address if connected and switching to wallet tab
    if (address && isConnected && newTab === 'wallet') {
      params.set('wallet_address', address);
    } else if (newTab === 'sso') {
      // For SSO tab, use user ID if available, otherwise remove wallet_address param
      if (user?.id) {
        params.set('wallet_address', user.id.toString());
      } else {
        params.delete('wallet_address');
      }
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Sync tab with URL params
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams, activeTab]);

  // Show loading while auth store hydrates (prevents flashing wrong content after SSO login)
  if (!isHydrated) {
    return <DashboardLoadingSpinner message={t('loadingDashboard')} />;
  }

  // Determine available tabs based on authentication status
  const availableTabs = [];

  // Wallet tab - available if wallet is connected
  if (isConnected && address) {
    availableTabs.push({
      id: 'wallet',
      label: t('walletTab'),
      icon: Wallet,
      available: true
    });
  }

  // SSO tab - available if user is authenticated via SSO
  if (isAuthenticated && authMethod === 'sso') {
    availableTabs.push({
      id: 'sso',
      label: t('ssoTab'),
      icon: User,
      available: true
    });
  }

  // If no tabs available, show connection prompt
  // IMPORTANT: Prioritize SSO authentication - if user is authenticated via SSO, don't show wallet prompt
  if (availableTabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-full p-6 mb-6">
          <User className="w-12 h-12 text-[#FF5D1B]" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {t('noDataAvailable')}
        </h3>
        <p className="text-gray-600 max-w-md mb-6">
          {t('connectWalletOrLogin')}
        </p>
        {/* Only show wallet connect if user is NOT authenticated via SSO */}
        {!isAuthenticated && (
          <div className="text-sm text-gray-500">
            {t('pleaseConnectToAccess')}
          </div>
        )}
      </div>
    );
  }

  // Ensure active tab is available
  const validTab = availableTabs.find(tab => tab.id === activeTab);
  if (!validTab && availableTabs.length > 0) {
    const defaultTab = availableTabs[0].id;
    handleTabChange(defaultTab);
    return null; // Re-render with correct tab
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      {availableTabs.length > 1 && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                    ${isActive
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`
                    w-5 h-5 mr-2 transition-colors duration-200
                    ${isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'wallet' && (
          <WalletDashboardContent walletAddress={address} />
        )}
        {activeTab === 'sso' && (
          <SSODashboardContent />
        )}
      </div>
    </div>
  );
}
