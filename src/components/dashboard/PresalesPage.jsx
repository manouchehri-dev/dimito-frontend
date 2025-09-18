"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePresales } from "@/lib/api";
import { useRouter } from "@/i18n/navigation";
import {
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  ExternalLink,
  Coins,
  Target,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  ShoppingCart
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { enUS, faIR } from "date-fns/locale";
// Removed modal import - using dedicated buy page instead

export default function PresalesPage() {
  const t = useTranslations("presales");
  const locale = useLocale();
  const isRTL = locale === "fa";
  const dateLocale = locale === "fa" ? faIR : enUS;
  const router = useRouter();

  const { data: presalesData, isLoading, error, refetch, isRefetching } = usePresales();


  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return `${dateStr} ${timeStr}`;
  };
  const [sortBy, setSortBy] = useState("start_time");
  const [filterStatus, setFilterStatus] = useState("all");

  // Format price with proper decimals
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return numPrice < 1 ? numPrice.toFixed(6) : numPrice.toFixed(2);
  };

  // Format large numbers
  const formatNumber = (num) => {
    const number = parseFloat(num);
    if (number >= 1e9) return (number / 1e9).toFixed(2) + "B";
    if (number >= 1e6) return (number / 1e6).toFixed(2) + "M";
    if (number >= 1e3) return (number / 1e3).toFixed(2) + "K";
    return number.toFixed(0);
  };

  // Get presale status
  const getPresaleStatus = (presale) => {
    const now = Date.now() / 1000;
    const startTime = presale.start_unix_timestamp;
    const endTime = presale.end_unix_timestamp;

    if (!presale.is_active) return "inactive";
    if (now < startTime) return "upcoming";
    if (now > endTime) return "ended";
    return "active";
  };

  // Get status color and icon
  const getStatusDisplay = (status) => {
    switch (status) {
      case "active":
        return {
          color: "text-green-600 bg-green-50 border-green-200",
          icon: <CheckCircle className="w-4 h-4" />,
          text: t("status.active")
        };
      case "upcoming":
        return {
          color: "text-blue-600 bg-blue-50 border-blue-200",
          icon: <Clock className="w-4 h-4" />,
          text: t("status.upcoming")
        };
      case "ended":
        return {
          color: "text-gray-600 bg-gray-50 border-gray-200",
          icon: <XCircle className="w-4 h-4" />,
          text: t("status.ended")
        };
      case "inactive":
        return {
          color: "text-red-600 bg-red-50 border-red-200",
          icon: <AlertCircle className="w-4 h-4" />,
          text: t("status.inactive")
        };
      default:
        return {
          color: "text-gray-600 bg-gray-50 border-gray-200",
          icon: <AlertCircle className="w-4 h-4" />,
          text: t("status.unknown")
        };
    }
  };

  const handleBuyClick = (e, presale) => {
    e.stopPropagation(); // Prevent card click navigation
    // Navigate to buy page - since each token has 1 presale, use token ID
    const presaleId = presale.id;
    router.push(`/presales/${presaleId}/buy`);
  };

  // Filter and sort presales
  const processedPresales = presalesData?.results
    ?.filter(presale => {
      if (filterStatus === "all") return true;
      return getPresaleStatus(presale) === filterStatus;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case "start_time":
          // Sort by status priority: active > upcoming > ended > inactive
          const statusPriority = { active: 4, upcoming: 3, ended: 2, inactive: 1 };
          const statusA = getPresaleStatus(a);
          const statusB = getPresaleStatus(b);
          return statusPriority[statusB] - statusPriority[statusA];
        case "end_time":
          return a.end_unix_timestamp - b.end_unix_timestamp;
        case "price":
          return parseFloat(a.price_per_token) - parseFloat(b.price_per_token);
        case "supply":
          return parseFloat(b.total_supply) - parseFloat(a.total_supply);
        default:
          return 0;
      }
    }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("error.title")}
        </h3>
        <p className="text-gray-600 mb-6">
          {t("error.description")}
        </p>
        <button
          onClick={() => refetch()}
          className="bg-[#FF5D1B] hover:bg-[#FF4A0F] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          {t("tryAgain")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("subtitle")}
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
          {t("refresh")}
        </button>
      </div>

      {/* Stats */}
      {presalesData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("stats.total")}</p>
                <p className="text-xl font-bold text-gray-900">{presalesData.count}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("stats.active")}</p>
                <p className="text-xl font-bold text-gray-900">
                  {processedPresales.filter(p => getPresaleStatus(p) === "active").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("stats.upcoming")}</p>
                <p className="text-xl font-bold text-gray-900">
                  {processedPresales.filter(p => getPresaleStatus(p) === "upcoming").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("stats.ended")}</p>
                <p className="text-xl font-bold text-gray-900">
                  {processedPresales.filter(p => getPresaleStatus(p) === "ended").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("filters.status")}
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FF5D1B] focus:border-transparent"
          >
            <option value="all">{t("filters.all")}</option>
            <option value="active">{t("status.active")}</option>
            <option value="upcoming">{t("status.upcoming")}</option>
            <option value="ended">{t("status.ended")}</option>
            <option value="inactive">{t("status.inactive")}</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("filters.sortBy")}
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FF5D1B] focus:border-transparent"
          >
            <option value="start_time">{t("filters.startTime")}</option>
            <option value="end_time">{t("filters.endTime")}</option>
            <option value="price">{t("filters.price")}</option>
            <option value="supply">{t("filters.supply")}</option>
          </select>
        </div>
      </div>

      {/* Presales Grid */}
      {processedPresales.length === 0 ? (
        <div className="text-center py-12">
          <Coins className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("empty.title")}
          </h3>
          <p className="text-gray-600">
            {t("empty.description")}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {processedPresales.map((presale) => {
            const status = getPresaleStatus(presale);
            const statusDisplay = getStatusDisplay(status);

            return (
              <div
                key={presale.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-[#FF5D1B] transition-all duration-200 hover:shadow-lg cursor-pointer group hover:scale-[1.01] active:scale-[0.99]"
                onClick={() => {
                  // Navigate to token details page
                  router.push(`/tokens/${presale.mine_token.id || presale.id}`);
                }}
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-900">
                      {presale.mine_token.token_name}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusDisplay.color}`}>
                      {statusDisplay.icon}
                      {statusDisplay.text}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{t("card.price")}</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formatPrice(presale.price_per_token)} {presale.payment_token.token_symbol}
                    </span>
                  </div>

                  {/* Purchases */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{t("card.purchases")}</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {presale.total_purchases}
                    </span>
                  </div>

                  {/* Timing - Ultra Compact */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{t("card.timing")}</span>
                    </div>
                    <div className={isRTL ? "text-end" : "text-start"}>
                      <div className="text-xs text-gray-900 font-medium">
                        {isRTL ? `${formatDate(new Date(presale.end_time)).split(' ')[0]} → ${formatDate(new Date(presale.start_time)).split(' ')[0]}` : `${formatDate(new Date(presale.start_time)).split(' ')[0]} → ${formatDate(new Date(presale.end_time)).split(' ')[0]}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isRTL ? `${formatDate(new Date(presale.end_time)).split(' ')[1]} - ${formatDate(new Date(presale.start_time)).split(' ')[1]}` : `${formatDate(new Date(presale.start_time)).split(' ')[1]} - ${formatDate(new Date(presale.end_time)).split(' ')[1]}`}
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{t("card.progress")}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {((parseFloat(presale.total_sold) / parseFloat(presale.total_supply)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((parseFloat(presale.total_sold) / parseFloat(presale.total_supply)) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-50 rounded-b-xl">
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] group-hover:from-[#FF4A0F] group-hover:to-[#FF2A2A] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 group-hover:shadow-lg text-center">
                      {t("card.viewDetails")}
                    </div>
                    {status === "active" && (
                      <button
                        onClick={(e) => handleBuyClick(e, presale)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {t("card.buy")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
