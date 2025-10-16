"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle, AlertCircle, ArrowRight, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const t = useTranslations("payment");
  const searchParams = useSearchParams();
  const router = useRouter();

  const trackId = searchParams.get("track_id");
  const autoPurchase = searchParams.get("auto_purchase");
  const tokenAmount = searchParams.get("token_amount");
  const tokenSymbol = searchParams.get("token_symbol");
  const error = searchParams.get("error");
  const reason = searchParams.get("reason");

  const isAutoPurchaseSuccess = autoPurchase === "true";
  const isAutoPurchaseFailed = autoPurchase === "failed";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
          {t("success.title")}
        </h1>
        
        <p className="text-center text-gray-600 mb-8">
          {t("success.subtitle")}
        </p>

        {/* Track ID */}
        {trackId && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t("success.trackId")}</span>
              <span className="font-mono font-bold text-gray-900">{trackId}</span>
            </div>
          </div>
        )}

        {/* Auto-Purchase Success */}
        {isAutoPurchaseSuccess && tokenAmount && tokenSymbol && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-2">
                  {t("success.autoPurchaseSuccess")}
                </h3>
                <p className="text-green-700 text-sm mb-3">
                  {t("success.tokensReceived")}
                </p>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {parseFloat(tokenAmount).toFixed(6)} {tokenSymbol}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auto-Purchase Failed */}
        {isAutoPurchaseFailed && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-orange-900 mb-2">
                  {t("success.autoPurchaseFailed")}
                </h3>
                <p className="text-orange-700 text-sm mb-2">
                  {t("success.manualPurchaseRequired")}
                </p>
                {error && (
                  <p className="text-xs text-orange-600 bg-white rounded p-2 font-mono">
                    {decodeURIComponent(error)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No Auto-Purchase (just wallet charge) */}
        {autoPurchase === "false" && !reason && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-blue-700 text-sm text-center">
              {t("success.walletCharged")}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {isAutoPurchaseFailed && (
            <Link
              href="/presales"
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-xl flex items-center justify-center gap-2"
            >
              {t("success.tryPurchaseAgain")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
          
          <Link
            href="/dashboard"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-xl flex items-center justify-center gap-2"
          >
            {t("success.viewDashboard")}
            <RefreshCw className="w-5 h-5" />
          </Link>

          <Link
            href="/"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            {t("success.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
