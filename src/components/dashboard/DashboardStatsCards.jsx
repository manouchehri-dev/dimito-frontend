"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import {
  ShoppingBag,
  CheckCircle,
  DollarSign,
  BarChart3,
  Rocket,
  Users,
  Calendar,
  Trophy
} from "lucide-react";

export default function DashboardStatsCards({ statistics }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  // Format large numbers with K, M, B suffixes
  const formatNumber = (num) => {
    const number = parseFloat(num);
    if (number >= 1e9) return (number / 1e9).toFixed(1) + "B";
    if (number >= 1e6) return (number / 1e6).toFixed(1) + "M";
    if (number >= 1e3) return (number / 1e3).toFixed(1) + "K";
    return number.toFixed(0);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (!statistics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { purchase_summary, participation_summary, recent_activity, account_status } = statistics;

  const statsData = [
    {
      title: t("stats.totalPurchases"),
      value: purchase_summary?.total_purchases || 0,
      subtitle: t("stats.totalPurchasesDesc"),
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50",
      trend: null
    },
    {
      title: t("stats.totalInvested"),
      value: `$${formatCurrency(purchase_summary?.total_invested || 0)}`,
      subtitle: t("stats.totalInvestedDesc"),
      icon: DollarSign,
      color: "text-orange-600 bg-orange-50",
      trend: null
    },
    {
      title: t("stats.tokensAcquired"),
      value: formatNumber(purchase_summary?.total_tokens_acquired || 0),
      subtitle: t("stats.tokensAcquiredDesc"),
      icon: BarChart3,
      color: "text-purple-600 bg-purple-50",
      trend: null
    },
    {
      title: t("stats.uniqueTokens"),
      value: participation_summary?.unique_tokens_purchased || 0,
      subtitle: t("stats.uniqueTokensDesc"),
      icon: Users,
      color: "text-teal-600 bg-teal-50",
      trend: null
    },
    {
      title: t("stats.recentActivity"),
      value: recent_activity?.purchases_last_30_days || 0,
      subtitle: t("stats.last30Days"),
      icon: Calendar,
      color: "text-pink-600 bg-pink-50",
      trend: null
    },
    {
      title: t("stats.averagePurchase"),
      value: `$${purchase_summary?.average_purchase_amount || 0}`,
      subtitle: t("stats.averagePurchaseDesc"),
      icon: Trophy,
      color: "text-amber-600 bg-amber-50",
      trend: null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Account Status Banner */}
      {/* <div className={`rounded-xl p-4 border ${
        account_status?.is_verified 
          ? "bg-green-50 border-green-200" 
          : "bg-yellow-50 border-yellow-200"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              account_status?.is_verified 
                ? "bg-green-100 text-green-600" 
                : "bg-yellow-100 text-yellow-600"
            }`}>
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {account_status?.is_verified ? t("stats.accountVerified") : t("stats.accountPending")}
              </h3>
              <p className="text-sm text-gray-600">
                {account_status?.is_verified 
                  ? t("stats.accountVerifiedDesc") 
                  : t("stats.accountPendingDesc")
                }
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">{t("stats.memberSince")}</p>
            <p className="text-sm font-medium text-gray-900">
              {account_status?.registration_date 
                ? new Date(account_status.registration_date).toLocaleDateString(locale)
                : "N/A"
              }
            </p>
          </div>
        </div>
      </div> */}

      {/* Stats Grid */}
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
                {stat.trend && (
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.trend > 0
                    ? "text-green-600 bg-green-50"
                    : "text-red-600 bg-red-50"
                    }`}>
                    {stat.trend > 0 ? "+" : ""}{stat.trend}%
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-xs text-gray-500">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Summary */}
      {recent_activity && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("stats.recentActivitySummary")}
              </h3>
              <p className="text-gray-600">
                {t("stats.recentActivityDesc", {
                  purchases: recent_activity.purchases_last_30_days,
                  amount: formatCurrency(recent_activity.investment_last_30_days)
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">
                ${formatCurrency(recent_activity.investment_last_30_days)}
              </p>
              <p className="text-sm text-gray-500">{t("stats.last30DaysInvestment")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
