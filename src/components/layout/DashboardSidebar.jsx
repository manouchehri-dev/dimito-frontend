"use client";

import { useTranslations, useLocale } from "next-intl";
import { useAccount, useDisconnect } from "wagmi";
import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  Rocket,
  TrendingUp,
  Headphones,
  Wallet,
  Shield,
} from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import useAuthStore from "@/stores/useAuthStore";

export default function DashboardSidebar({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}) {
  const t = useTranslations("dashboard");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const isRTL = locale === "fa";
  const pathname = usePathname();
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { isAuthenticated, logout, authMethod } = useAuthStore();

  // Handle wallet disconnect
  const handleWalletDisconnect = () => {
    disconnect();
    if (onClose) onClose(); // Close mobile sidebar
  };

  // Handle SSO logout
  const handleSSOLogout = async () => {
    try {
      // Import OIDC configuration
      const { generateLogoutUrl } = await import('@/lib/auth/oidcConfig');

      // Generate logout URL
      const logoutUrl = generateLogoutUrl({
        postLogoutRedirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/sign-out`,
      });

      if (onClose) onClose(); // Close mobile sidebar

      // Redirect to OIDC provider logout
      router.push(logoutUrl);
    } catch (error) {
      console.error('Error during SSO logout:', error);

      // Fallback: clear local state and redirect
      logout();
      sessionStorage.clear();
      if (onClose) onClose();
      router.push('/?logout=fallback');
    }
  };

  const navigation = [
    {
      name: t("overview"),
      href: "/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/dashboard",
    },
    {
      name: t("presale"),
      href: "/dashboard/presales",
      icon: TrendingUp,
      current: pathname === "/dashboard/presales",
    },
    {
      name: t("purchases.title"),
      href: "/dashboard/purchases",
      icon: ShoppingBag,
      current: pathname === "/dashboard/purchases",
    },
    {
      name: t("participatedPresales.title"),
      href: "/dashboard/participated-presales",
      icon: Rocket,
      current: pathname === "/dashboard/participated-presales",
    },
    {
      name: t("support.title"),
      href: "/dashboard/support",
      icon: Headphones,
      current: pathname === "/dashboard/support",
    },
  ];

  const secondaryNavigation = [
    {
      name: t("settings.title"),
      href: "/dashboard/settings",
      icon: Settings,
      current: pathname === "/dashboard/settings",
    },
  ];

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 ${isRTL ? "right-0" : "left-0"
          } z-50 w-64 bg-white shadow-xl lg:hidden transform transition-transform duration-300 ${isOpen
            ? "translate-x-0"
            : isRTL
              ? "translate-x-full"
              : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => router.push("/")}
            >
              <img src="/logo.png" alt="DMT Token" className="w-10" />
              <span className="font-bold text-lg text-gray-900">DMT Token</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${item.current
                    ? "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Secondary navigation */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${item.current
                    ? "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}

            {/* Logout buttons */}
            {/* Wallet Disconnect */}
            {isConnected && (
              <button
                onClick={handleWalletDisconnect}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-orange-600 hover:bg-orange-50 transition-all duration-200 w-full cursor-pointer"
              >
                <Wallet className="w-5 h-5" />
                {tAuth("disconnectWallet")}
              </button>
            )}

            {/* SSO Logout */}
            {isAuthenticated && (
              <button
                onClick={handleSSOLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 w-full cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                {tAuth("logout")}
              </button>
            )}

            {/* Nothing to logout message */}
            {!isConnected && !isAuthenticated && (
              <div className="px-3 py-3 bg-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <span className="text-sm">{tAuth("notLoggedIn")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden lg:fixed lg:inset-y-0 ${isRTL ? "lg:right-0" : "lg:left-0"
          } lg:z-50 ${isCollapsed ? "lg:w-16" : "lg:w-64"
          } lg:flex lg:flex-col transition-all duration-300`}
      >
        <div className="flex flex-col flex-1 bg-white border-r border-gray-200 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div
              className="flex items-start gap-3 cursor-pointer"
              onClick={() => router.push("/")}
            >
              <img src="/logo.png" alt="DMT Token" className="w-10" />
              {!isCollapsed && (
                <span className="font-bold text-lg text-gray-900">
                  DMT Token
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${item.current
                    ? "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  title={isCollapsed ? item.name : ""}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Secondary navigation */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${item.current
                    ? "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  title={isCollapsed ? item.name : ""}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
              );
            })}

            {/* Logout buttons */}
            {/* Wallet Disconnect */}
            {isConnected && (
              <button
                onClick={handleWalletDisconnect}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-orange-600 hover:bg-orange-50 transition-all duration-200 w-full ${isCollapsed ? "justify-center cursor-pointer" : ""
                  }`}
                title={isCollapsed ? tAuth("disconnectWallet") : ""}
              >
                <Wallet className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{tAuth("disconnectWallet")}</span>}
              </button>
            )}

            {/* SSO Logout */}
            {isAuthenticated && (
              <button
                onClick={handleSSOLogout}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 w-full ${isCollapsed ? "justify-center cursor-pointer" : ""
                  }`}
                title={isCollapsed ? tAuth("logout") : ""}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{tAuth("logout")}</span>}
              </button>
            )}

            {/* Nothing to logout message - only show when not collapsed */}
            {!isConnected && !isAuthenticated && !isCollapsed && (
              <div className="px-3 py-3 bg-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <span className="text-xs">{tAuth("notLoggedIn")}</span>
                </div>
              </div>
            )}

            {/* Expand button when collapsed */}
            {isCollapsed && (
              <button
                onClick={onToggleCollapse}
                className="flex items-center justify-center px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all duration-200 w-full"
                title={t("expand")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
