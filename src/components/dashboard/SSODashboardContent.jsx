"use client";

import { useTranslations } from "next-intl";
import { useAccount } from "wagmi";
import useAuthStore from "@/stores/useAuthStore";
import { useDashboardData } from "@/hooks/useDashboardData";
import LoadingSpinner from "@/components/dashboard/LoadingSpinner";
import ErrorState from "@/components/dashboard/ErrorState";
import SSOUserInfoCard from "@/components/dashboard/SSOUserInfoCard";
import SSOStatsCards from "@/components/dashboard/SSOStatsCards";
import SSOAssetsCard from "@/components/dashboard/SSOAssetsCard";
import SSOTransactionsCard from "@/components/dashboard/SSOTransactionsCard";
import { RefreshCw } from "lucide-react";

export default function SSODashboardContent() {
  const t = useTranslations("dashboard");
  const { address } = useAccount();
  const { user } = useAuthStore();

  // Use wallet address if available, otherwise use user ID or a placeholder for SSO-only users
  const walletAddress = address || user?.id?.toString() || "sso_user";
  const { dashboardData, loading, error, refetch } = useDashboardData(
    walletAddress,
    "sso"
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  // Extract SSO data from the new API structure
  const ssoData = dashboardData?.sso_data;
  const userInfo = ssoData?.user_info;
  const displayName = ssoData?.display_name;
  const message = ssoData?.message;
  const assets = ssoData?.assets || [];
  const transactions = ssoData?.transactions || {};

  return (
    <div className="space-y-8">
      {/* Welcome Section with User Info */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              <span dir="ltr">{displayName || userInfo?.first_name || "User"}</span> {t("welcome")}!
            </h1>
            <p className="text-gray-600 mt-2">{t("ssoWelcomeDescription")}</p>
          </div>
          <button
            onClick={refetch}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t("refreshData")}
          </button>
        </div>

        <SSOUserInfoCard userInfo={userInfo} />
      </div>

      {/* Statistics Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t("statisticsOverview")}
        </h2>
        <SSOStatsCards assets={assets} transactions={transactions} />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SSOAssetsCard assets={assets} />
        <SSOTransactionsCard transactions={transactions} />
      </div>
    </div>
  );
}
