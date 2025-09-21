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
import { useAccount } from "wagmi";
import { RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { address, isConnected } = useAccount();
  const { dashboardData, loading, error, refetch } = useDashboardData(address);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section with User Info */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("welcome")} {dashboardData?.user_info?.first_name || "User"}! 👋
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
        
        <UserInfoCard userInfo={dashboardData?.user_info} />
      </div>

      {/* Statistics Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t("statisticsOverview")}
        </h2>
        <DashboardStatsCards statistics={dashboardData?.statistics} />
      </div>

      {/* Platform Token Balances */}
      <div className="mb-8">
        <UserTokenBalances />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentPurchasesCard recentPurchases={dashboardData?.recent_purchases} />
        <ParticipatedPresalesCard participatedPresales={dashboardData?.participated_presales} />
      </div>
    </div>
  );
}
