"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function LocaleNotFound() {
  const t = useTranslations("notFound");
  const locale = useLocale();
  const isRTL = locale === "fa";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/logo.png"
            alt="IMD Token Logo"
            className="w-20 h-20 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-800">IMD Token</h1>
        </div>

        {/* 404 Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="mb-8">
            {/* Large 404 Number */}
            <div className="relative mb-6">
              <h2 className="text-8xl font-bold bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] bg-clip-text text-transparent">
                404
              </h2>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            </div>

            {/* Title and Description */}
            <h3
              className={`text-2xl font-bold text-gray-800 mb-4 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("title")}
            </h3>
            <p
              className={`text-gray-600 leading-relaxed mb-6 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("description")}
            </p>

            {/* Suggestions */}
            <div
              className={`text-sm text-gray-500 mb-6 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <p className="font-medium mb-2">{t("suggestions.title")}:</p>
              <ul className="space-y-1">
                <li>• {t("suggestions.checkUrl")}</li>
                <li>• {t("suggestions.useNavigation")}</li>
                <li>• {t("suggestions.searchBelow")}</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href={`/${locale}`}
              className={`flex items-center justify-center gap-3 w-full bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white font-medium py-3 px-6 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Home className="w-5 h-5" />
              {t("actions.goHome")}
            </Link>

            <Link
              href={`/${locale}`}
              className={`flex items-center justify-center gap-3 w-full bg-white border-2 border-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-200 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Search className="w-5 h-5" />
              {t("actions.explore")}
            </Link>

            <button
              onClick={() => window.history.back()}
              className={`flex items-center justify-center gap-3 w-full bg-gray-100 text-gray-600 font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-all duration-200 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <ArrowLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
              {t("actions.goBack")}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div
          className={`text-sm text-gray-500 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          <p>{t("help")}</p>
        </div>
      </div>
    </div>
  );
}
