"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { DollarSign, Users, Calendar, TrendingUp, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { enUS, faIR } from "date-fns/locale";
import { usePresales } from "@/lib/api";

const Projects = () => {
  const t = useTranslations("projects");
  const locale = useLocale();
  const isRTL = locale === "fa";
  const router = useRouter();

  // Fetch presales data
  const { data: presalesData, isLoading, error } = usePresales();




  // Static fallback data
  const staticProjectData = [
    {
      title: t("gold_mine_kerman.title"),
      quantity: t("gold_mine_kerman.quantity"),
      value: t("gold_mine_kerman.value"),
      status: t("gold_mine_kerman.status"),
    },
    {
      title: t("cooper.title"),
      quantity: t("cooper.quantity"),
      value: t("cooper.value"),
      status: t("cooper.status"),
    },
    {
      title: t("lithium.title"),
      quantity: t("lithium.quantity"),
      value: t("lithium.value"),
      status: t("lithium.status"),
    },
  ];

  // Helper functions for presales
  const getPresaleStatus = (presale) => {
    const now = Date.now();
    const startTime = new Date(presale.start_time).getTime();
    const endTime = new Date(presale.end_time).getTime();

    if (now < startTime) return "upcoming";
    if (now > endTime) return "ended";
    if (parseFloat(presale.total_sold) >= parseFloat(presale.total_supply)) return "inactive";
    return "active";
  };

  const getPresaleStatusDisplay = (status) => {
    const displays = {
      active: {
        text: isRTL ? "فعال" : "Active",
        color: "bg-green-100 text-green-700 border-green-200"
      },
      upcoming: {
        text: isRTL ? "آینده" : "Upcoming",
        color: "bg-blue-100 text-blue-700 border-blue-200"
      },
      ended: {
        text: isRTL ? "پایان یافته" : "Ended",
        color: "bg-gray-100 text-gray-700 border-gray-200"
      },
      inactive: {
        text: isRTL ? "غیرفعال" : "Inactive",
        color: "bg-red-100 text-red-700 border-red-200"
      }
    };
    return displays[status] || displays.inactive;
  };

  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  };


  // Get top 3 recent presales or use static data
  const hasPresales = presalesData?.results && presalesData.results.length > 0;
  const displayData = hasPresales
    ? presalesData.results.slice(0, 3)
    : staticProjectData;

  // Helper to determine status type from localized string
  const getStatusType = (status) => {
    const statusLower = String(status).toLowerCase();

    // Check for pending/awaiting status
    const pendingWords = ["pending", "در انتظار", "معلق", "در حال بررسی"];
    if (pendingWords.some((word) => statusLower.includes(word.toLowerCase()))) {
      return "pending";
    }

    // Check for active status
    const activeWords = ["active", "فعال", "فعال است"];
    if (activeWords.some((word) => statusLower.includes(word.toLowerCase()))) {
      return "active";
    }

    // Default to inactive
    return "inactive";
  };

  // Get proper status display text
  const getStatusDisplay = (status) => {
    const statusType = getStatusType(status);

    switch (statusType) {
      case "pending":
        return isRTL ? "در انتظار" : "Pending";
      case "active":
        return isRTL ? "فعال" : "Active";
      case "inactive":
        return isRTL ? "غیر فعال" : "Inactive";
      default:
        return status; // fallback to original status
    }
  };

  // Get proper value/quantity display
  const getValueDisplay = (value, status) => {
    const statusType = getStatusType(status);

    if (statusType === "pending") {
      return isRTL ? "در حال بررسی" : "Under Review";
    }

    return value;
  };

  // Get status styling
  const getStatusStyling = (status) => {
    const statusType = getStatusType(status);

    switch (statusType) {
      case "pending":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "active":
        return "bg-green-100 text-green-800 border border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  return (
    <section
      id="projects"
      className="lg:py-14 relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-l from-[#FF5D1B]/5 to-[#FF363E]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-[clamp(16px,2.5vw,20px)] text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="my-8 lg:my-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF5D1B]" />
          </div>
        )}

        {/* Cards Grid */}
        {!isLoading && (
          <>
            <div className="my-8 lg:my-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hasPresales ? (
                // Simplified Real Presales Cards for Home
                displayData.map((presale) => {
                  const status = getPresaleStatus(presale);
                  const statusDisplay = getPresaleStatusDisplay(status);
                  const progress = ((parseFloat(presale.total_sold) / parseFloat(presale.total_supply)) * 100);

                  return (
                    <div
                      key={presale.id}
                      className="group relative bg-white rounded-2xl border border-gray-200 hover:border-[#FF5D1B] transition-all duration-300 hover:shadow-xl cursor-pointer overflow-hidden hover:scale-[1.02]"
                      onClick={() => router.push(`/tokens/${presale.mine_token.id}`)}
                    >
                      {/* Gradient Background Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#FF5D1B]/5 via-transparent to-[#FF363E]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Content */}
                      <div className="relative p-6 text-center">
                        {/* Status Badge */}
                        <div className="flex justify-center mb-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusDisplay.color}`}>
                            {statusDisplay.text}
                          </span>
                        </div>

                        {/* Token Name */}
                        <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-[#FF5D1B] transition-colors duration-300">
                          {presale.mine_token.token_name}
                        </h3>

                        {/* Price - Highlighted */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-1">{t("card.price")}</p>
                          <p className="text-2xl font-bold text-[#FF5D1B]">
                            {isRTL ? `${presale.payment_token.token_symbol} ${formatPrice(presale.price_per_token)}` : `${formatPrice(presale.price_per_token)} ${presale.payment_token.token_symbol}`}
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">{t("card.sold")}</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Simplified Static Cards for Home
                displayData.map((project, index) => {
                  const statusType = getStatusType(project.status);

                  return (
                    <div
                      key={index}
                      className="group relative bg-white rounded-2xl border border-gray-200 hover:border-[#FF5D1B] transition-all duration-300 hover:shadow-xl cursor-pointer overflow-hidden hover:scale-[1.02]"
                    >
                      {/* Gradient Background Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#FF5D1B]/5 via-transparent to-[#FF363E]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Content */}
                      <div className="relative p-6 text-center">
                        {/* Status Badge */}
                        <div className="flex justify-center mb-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyling(project.status)}`}>
                            {getStatusDisplay(project.status)}
                          </span>
                        </div>

                        {/* Project Name */}
                        <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-[#FF5D1B] transition-colors duration-300">
                          {project.title}
                        </h3>

                        {/* Value - Highlighted */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-1">{t("card.estimatedValue")}</p>
                          <p className="text-2xl font-bold text-[#FF5D1B]">
                            {getValueDisplay(project.value, project.status)}
                          </p>
                        </div>

                        {/* Phase Info */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">{t("card.currentPhase")}</p>
                          <p className="font-semibold text-gray-900">
                            {getValueDisplay(project.quantity, project.status)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Enhanced View More Button */}
            <div className="text-center mt-10">

              <Link
                href={"/presales"}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-semibold text-lg cursor-pointer"
              >
                <span>{t("viewMorePresales")}</span>
                {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </Link>

            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Projects;
