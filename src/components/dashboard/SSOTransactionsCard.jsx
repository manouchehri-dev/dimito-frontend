"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";

export default function SSOTransactionsCard({ transactions = {} }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();

  const { results = [] } = transactions;

  // Show only recent 5 transactions
  const recentTransactions = results.slice(0, 10);

  // Format number
  const formatNumber = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(num);
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  // Get status icon and color
  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
        return {
          icon: CheckCircle,
          color: "text-green-600",
        };
      case "pending":
        return {
          icon: Clock,
          color: "text-yellow-600",
        };
      case "failed":
        return {
          icon: XCircle,
          color: "text-red-600",
        };
      default:
        return {
          icon: Clock,
          color: "text-gray-600",
        };
    }
  };

  // Get transaction type display
  const getTypeDisplay = (type) => {
    const typeMap = {
      Deposit: {
        label: t("transactions.typeDeposit"),
        icon: ArrowDownLeft,
        color: "text-green-600",
      },
      Withdrawal: {
        label: t("transactions.typeWithdrawal"),
        icon: ArrowUpRight,
        color: "text-red-600",
      },
      Cash_deposit: {
        label: t("transactions.typeCashDeposit"),
        icon: ArrowDownLeft,
        color: "text-blue-600",
      },
      Transfer: {
        label: t("transactions.typeTransfer"),
        icon: ArrowRightLeft,
        color: "text-purple-600",
      },
    };
    return (
      typeMap[type] || {
        label: type,
        icon: ArrowRightLeft,
        color: "text-gray-600",
      }
    );
  };

  if (recentTransactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-orange-500" />
            {t("transactions.title")}
          </h3>
        </div>
        <div className="text-center py-8">
          <ArrowRightLeft className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t("transactions.noTransactions")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-orange-500" />
          {t("transactions.title")}
        </h3>
        <span className="text-sm text-gray-500">
          {t("recentPurchases.showing", { count: recentTransactions.length })}
        </span>
      </div>

      {/* Transactions List - Compact Design */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {recentTransactions.map((tx) => {
          const typeDisplay = getTypeDisplay(tx.type);
          const statusDisplay = getStatusDisplay(tx.status);
          const TypeIcon = typeDisplay.icon;
          const StatusIcon = statusDisplay.icon;

          return (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              {/* Left: Transaction Info */}
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`p-2 rounded-full bg-gray-100 ${typeDisplay.color}`}
                >
                  <TypeIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {typeDisplay.label}
                    </h4>
                    <StatusIcon
                      className={`w-4 h-4 ${statusDisplay.color} flex-shrink-0`}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
                </div>
              </div>

              {/* Right: Amount */}
              <div className="text-right">
                <p className="font-semibold text-gray-900 text-sm">
                  {formatNumber(tx.amount)} {tx.origin_unit}
                </p>
                {tx.tax > 0 && (
                  <p className="text-xs text-gray-500">
                    {t("transactions.fee")}: {formatNumber(tx.tax)} IRR
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      {results.length > 5 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => {
              router.push("/dashboard/purchases/?tab=sso");
            }}
            className="w-full flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors duration-200"
          >
            {t("recentPurchases.viewAll")}
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
