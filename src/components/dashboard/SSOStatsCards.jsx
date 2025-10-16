"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  Wallet,
  Coins,
  ArrowRightLeft,
  TrendingUp,
  PieChart,
} from "lucide-react";

export default function SSOStatsCards({ assets = [], transactions = {} }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  // Calculate total portfolio value
  const totalValue = assets.reduce(
    (sum, asset) => sum + (asset.item_value || 0),
    0
  );

  // Count assets with balance
  const assetsWithBalance = assets.filter((a) => a.amount > 0).length;

  // Transaction count
  const totalTransactions = transactions.count || 0;

  // Recent transactions (last 30 days - approximate)
  const recentTransactions = transactions.results?.length || 0;

  // Format currency
  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const statsData = [
    {
      title: t("assets.totalPortfolioValue"),
      value: `${formatCurrency(totalValue)} IRR`,
      subtitle: `${assetsWithBalance} ${t("assets.assetsWithBalance")}`,
      icon: PieChart,
      color: "text-orange-600 bg-orange-50",
    },
    {
      title: t("stats.uniqueTokens"),
      value: assetsWithBalance,
      subtitle: t("assets.assets"),
      icon: Coins,
      color: "text-teal-600 bg-teal-50",
    },
    {
      title: t("transactions.totalTransactions"),
      value: totalTransactions,
      subtitle: `${recentTransactions} ${t("transactions.shown")}`,
      icon: ArrowRightLeft,
      color: "text-blue-600 bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;

        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <IconComponent className="w-6 h-6" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </p>
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
