"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Wallet, ExternalLink, TrendingUp, TrendingDown, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { createPortal } from "react-dom";

export default function SSOAssetsCard({ assets = [] }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const [showAllModal, setShowAllModal] = useState(false);



  // Use mock data if assets is empty, otherwise use real data
  const assetsData = assets;

  // Filter assets with balance and sort by value
  const assetsWithBalance = assetsData
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
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      {assetsData.filter((a) => a.amount > 0).length > 6 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setShowAllModal(true)}
            className="w-full flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors duration-200"
          >
            {t("assets.viewAll")}
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* All Assets Modal */}
      {showAllModal && typeof window !== "undefined" && createPortal(
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAllModal(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 sm:p-5 text-white relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="w-6 h-6" />
                  <h2 className="text-lg sm:text-xl font-bold">
                    {t("assets.allAssets")}
                  </h2>
                </div>
                <button
                  onClick={() => setShowAllModal(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/90 text-sm mt-2">
                {locale === "fa"
                  ? `مجموع ${assetsData.filter((a) => a.amount > 0).length} دارایی`
                  : `Total ${assetsData.filter((a) => a.amount > 0).length} assets`}
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assetsData
                  .filter((asset) => asset.amount > 0)
                  .sort((a, b) => (b.item_value || 0) - (a.item_value || 0))
                  .map((asset, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        {/* Asset Icon */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center flex-shrink-0">
                          <Wallet className="w-6 h-6 text-orange-600" />
                        </div>

                        {/* Asset Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">
                              {asset.name}
                            </h4>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">
                              {locale === "fa" ? "موجودی" : "Balance"}:
                            </span>
                            <span className="font-semibold text-gray-900" dir="ltr">
                              {formatNumber(asset.amount)} {asset.unit}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="text-gray-600">
                              {locale === "fa" ? "ارزش" : "Value"}:
                            </span>
                            <span className="font-bold text-orange-600" dir="ltr">
                              {formatNumber(asset.item_value)}{" "}
                              {locale === "fa" ? "ریال" : "Rials"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
