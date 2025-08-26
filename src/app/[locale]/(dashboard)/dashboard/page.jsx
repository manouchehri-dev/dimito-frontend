"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import QuickStatsCards from "@/components/dashboard/QuickStatsCards";
import TokenHoldingsSection from "@/components/dashboard/TokenHoldingsSection";
import RecentActivityFeed from "@/components/dashboard/RecentActivityFeed";
import LoadingSpinner from "@/components/dashboard/LoadingSpinner";
import ErrorState from "@/components/dashboard/ErrorState";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAccount } from "wagmi";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { address, isConnected } = useAccount();
  const { dashboardData, loading, error, refetch } = useDashboardData(address);

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-primary">
          {t("connectWallet")}
        </h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {t("connectWalletDescription")}
        </p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-8">
      {/* Quick Stats Cards */}
      <QuickStatsCards overview={dashboardData?.overview} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Token Holdings - Takes 2/3 width on desktop */}
        <div className="xl:col-span-2">
          <TokenHoldingsSection
            tokenHoldings={dashboardData?.token_holdings_summary}
            onTokenClick={(tokenSymbol) => {
              // Navigate to detailed token view
              window.location.href = `/dashboard/token/${tokenSymbol}`;
            }}
          />
        </div>

        {/* Recent Activity Sidebar - Takes 1/3 width on desktop */}
        <div className="xl:col-span-1">
          <RecentActivityFeed recentActivity={dashboardData?.recent_activity} />
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center py-6">
        <button
          onClick={refetch}
          className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 mx-auto"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {t("refreshData")}
        </button>
      </div>
    </div>
  );
}
