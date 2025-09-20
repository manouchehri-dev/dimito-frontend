"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAccount } from "wagmi";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import WalletConnectionModal from "@/components/modals/WalletConnectionModal";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const locale = useLocale();
  const isRTL = locale === "fa";
  const t = useTranslations("dashboard");
  const { isConnected, isConnecting, isReconnecting } = useAccount();

  // Wait for wallet connection state to be determined
  useEffect(() => {
    // Give some time for wallet to auto-connect, then show modal if needed
    const timer = setTimeout(() => {
      setIsWalletLoading(false);
    }, 1000); // Wait 1 second for auto-connection

    return () => clearTimeout(timer);
  }, []);

  // Update loading state based on connection status
  useEffect(() => {
    if (!isConnecting && !isReconnecting) {
      setIsWalletLoading(false);
    }
  }, [isConnecting, isReconnecting]);

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div
        className={`${
          isRTL
            ? sidebarCollapsed
              ? "lg:mr-16"
              : "lg:mr-64"
            : sidebarCollapsed
            ? "lg:ml-16"
            : "lg:ml-64"
        } transition-all duration-300`}
      >
        {/* Header */}
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isCollapsed={sidebarCollapsed}
        />

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {isWalletLoading || isConnecting || isReconnecting ? (
            // Loading state while checking wallet connection
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#FF5D1B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm">{t("checkingWalletConnection")}</p>
              </div>
            </div>
          ) : !isConnected ? (
            // Show modal only when wallet is definitely not connected and not trying to connect
            <WalletConnectionModal
              isOpen={!isConnected && !isWalletLoading && !isConnecting && !isReconnecting}
              onClose={() => setShowWalletModal(false)}
            />
          ) : (
            // Show dashboard content when wallet is connected
            children
          )}
        </main>
      </div>
    </div>
  );
}
