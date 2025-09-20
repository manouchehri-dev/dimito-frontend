"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  TrendingUp,
  Zap,
  Shield,
  Clock,
  BarChart3,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

const MarketSection = () => {
  const t = useTranslations("market");
  const locale = useLocale();
  const isRTL = locale === "fa";

  const marketFeatures = [
    {
      icon: Zap,
      title: t("features.liquidityPool"),
      description: t("features.fastSecureTrading"),
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: BarChart3,
      title: t("features.orderBook"),
      description: t("features.stableLiquidity"),
      color: "from-green-500 to-green-600"
    },
    {
      icon: Shield,
      title: t("features.nonCustodial"),
      description: t("features.accessExchanges"),
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <section
      id="market"
      className="py-16 lg:py-24 relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-l from-[#FF5D1B]/5 to-[#FF363E]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-[clamp(16px,2.5vw,20px)] text-gray-600 max-w-4xl mx-auto leading-relaxed mb-4">
            {t("subtitle")}
          </p>
          <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Features Cards */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              {t("features.title")}
            </h3>

            {marketFeatures.map((feature, index) => {
              const IconComponent = feature.icon;

              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#FF5D1B] transition-colors duration-300">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Check Icon */}
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coming Soon Section */}
          <div className="relative">
            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-r from-[#FF5D1B]/20 to-[#FF363E]/20 rounded-full blur-xl"></div>

            {/* Main Card */}
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
              {/* Coming Soon Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white px-6 py-2 rounded-full shadow-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span className="font-semibold text-sm">
                      {t("comingSoon.badge")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-6">
                {/* Icon */}
                <div className="w-20 h-20 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("comingSoon.title")}
                </h3>

                <p className="text-gray-600 leading-relaxed mb-8">
                  {t("comingSoon.description")}
                </p>

                {/* Stats Preview */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-[#FF5D1B] mb-1">24/7</div>
                    <div className="text-sm text-gray-600">
                      {t("comingSoon.trading")}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-[#FF5D1B] mb-1">0%</div>
                    <div className="text-sm text-gray-600">
                      {t("comingSoon.fees")}
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  disabled
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gray-200 text-gray-500 rounded-2xl cursor-not-allowed font-semibold text-lg relative overflow-hidden"
                >
                  <span>
                    {t("comingSoon.enterMarket")}
                  </span>
                  {isRTL ? (
                    <ArrowLeft className="w-5 h-5" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}

                </button>

                <p className="text-xs text-gray-500 mt-4">
                  {t("comingSoon.launchInfo")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketSection;
