"use client";

import { useTranslations, useLocale } from "next-intl";
import TokenBalanceCard from "@/components/dashboard/TokenBalanceCard";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import TokenChart from "@/components/dashboard/TokenChart";
import DashboardStats from "@/components/dashboard/DashboardStats";

export default function Dashboard() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isRTL = locale === "fa";

  return (
    <div className="max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("title")}</h1>
        <p className="text-gray-600">{t("subtitle")}</p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Token Balance Card */}
          <TokenBalanceCard />

          {/* Token Chart */}
          <TokenChart />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Dashboard Stats */}
          <DashboardStats />

          {/* Recent Transactions */}
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
