"use client";

import { useTranslations } from "next-intl";
import UserInfoCard from "@/components/dashboard/UserInfoCard";
import DashboardStatsCards from "@/components/dashboard/DashboardStatsCards";
import RecentPurchasesCard from "@/components/dashboard/RecentPurchasesCard";
import ParticipatedPresalesCard from "@/components/dashboard/ParticipatedPresalesCard";
import UserTokenBalances from "@/components/dashboard/UserTokenBalances";
import LoadingSpinner from "@/components/dashboard/LoadingSpinner";
import ErrorState from "@/components/dashboard/ErrorState";
import { useDashboardData } from "@/hooks/useDashboardData";
import { RefreshCw } from "lucide-react";

export default function WalletDashboardContent({ walletAddress }) {
  const t = useTranslations("dashboard");
  const { dashboardData, loading, error, refetch } = useDashboardData(walletAddress, 'wallet');

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  // Extract wallet data from the new API structure
  const walletData = dashboardData?.wallet_data;
  const userInfo = walletData?.user_info;
  const recentPurchases = walletData?.recent_purchases;
  const participatedPresales = walletData?.participated_presales;
  const statistics = walletData?.statistics;

  return (
    <div className="space-y-8">
      {/* Welcome Section with User Info */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("welcome")} {userInfo?.first_name || "User"}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              {t("welcomeDescription")}
            </p>
          </div>
          <button
            onClick={refetch}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t("refreshData")}
          </button>
        </div>
        
        <UserInfoCard userInfo={userInfo} />
      </div>

      {/* Statistics Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t("statisticsOverview")}
        </h2>
        <DashboardStatsCards statistics={statistics} />
      </div>

      {/* Platform Token Balances */}
      <div className="mb-8">
        <UserTokenBalances />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentPurchasesCard recentPurchases={recentPurchases} />
        <ParticipatedPresalesCard participatedPresales={participatedPresales} />
      </div>
    </div>
  );
}
