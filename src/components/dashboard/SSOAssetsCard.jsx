"use client";

import { useTranslations, useLocale } from "next-intl";
import { Wallet, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";

export default function SSOAssetsCard({ assets = [] }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();

  // Filter assets with balance and sort by value
  const assetsWithBalance = assets
    .filter((asset) => asset.amount > 0)
    .sort((a, b) => (b.item_value || 0) - (a.item_value || 0))
    .slice(0, 6); // Show top 6

  // Format number
  const formatNumber = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Format amount with up to 8 decimals for crypto
  const formatAmount = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    }).format(num);
  };

  if (assetsWithBalance.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-orange-500" />
            {t("assets.title")}
          </h3>
        </div>
        <div className="text-center py-8">
          <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t("assets.noAssetsFound")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-orange-500" />
          {t("assets.title")}
        </h3>
        <span className="text-sm text-gray-500">
          {t("assets.showing")} {assetsWithBalance.length}
        </span>
      </div>

      {/* Assets List - Compact Design */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {assetsWithBalance.map((asset) => (
          <div
            key={asset.id}
            className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            {/* Left: Asset Info */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {asset.name.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {asset.name}
                  </h4>
                </div>
                <p className="text-xs text-gray-500">
                  {formatAmount(asset.amount)} {asset.unit}
                </p>
              </div>
            </div>

            {/* Right: Value */}
            <div className="text-right">
              <p className="font-semibold text-gray-900 text-sm">
                {formatNumber(asset.item_value || 0)} IRR
              </p>
              {asset.change !== null && (
                <p
                  className={`text-xs flex items-center justify-end gap-1 ${asset.change > 0 ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {asset.change > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(asset.change)}%
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      {assets.filter((a) => a.amount > 0).length > 6 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => {
              /* TODO: Navigate to full assets page */
            }}
            className="w-full flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors duration-200"
          >
            {t("assets.viewAll")}
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
