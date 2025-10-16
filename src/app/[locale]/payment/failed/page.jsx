"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { XCircle, ArrowLeft, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function PaymentFailedPage() {
  const t = useTranslations("payment");
  const searchParams = useSearchParams();

  const trackId = searchParams.get("track_id");

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
          {t("failed.title")}
        </h1>
        
        <p className="text-center text-gray-600 mb-8">
          {t("failed.subtitle")}
        </p>

        {/* Track ID */}
        {trackId && trackId !== 'unknown' && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t("failed.trackId")}</span>
              <span className="font-mono font-bold text-gray-900">{trackId}</span>
            </div>
          </div>
        )}

        {/* Possible Reasons */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-orange-900 mb-3">
            {t("failed.possibleReasons")}
          </h3>
          <ul className="space-y-2 text-sm text-orange-700">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>{t("failed.reason1")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>{t("failed.reason2")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>{t("failed.reason3")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>{t("failed.reason4")}</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/presales"
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-xl flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            {t("failed.tryAgain")}
          </Link>

          <Link
            href="/"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            {t("failed.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
