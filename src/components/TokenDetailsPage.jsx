"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useTokenDetails } from "@/lib/api";
import { useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Coins,
  TrendingUp,
  Users,
  FileText,
  MapPin,
  Calendar,
  DollarSign,
  Target,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  ShoppingCart,
  BarChart3,
  PieChart,
  Zap,
  Shield
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { enUS, faIR } from "date-fns/locale";
// Removed modal import - using dedicated buy page instead

export default function TokenDetailsPage({ tokenId }) {
  const t = useTranslations("tokenDetails");
  const locale = useLocale();
  const isRTL = locale === "fa";
  const dateLocale = locale === "fa" ? faIR : enUS;
  const router = useRouter();

  const { data: tokenData, isLoading, error, refetch, isRefetching } = useTokenDetails(tokenId);

  const [activeTab, setActiveTab] = useState("overview");

  // Helper functions
  const formatPrice = (price) => {
    const num = parseFloat(price);
    if (num === 0) return "0";
    if (num < 0.001) return num.toExponential(2);
    return num.toFixed(6);
  };

  const formatLargeNumber = (num) => {
    const number = parseFloat(num);
    if (number >= 1e9) return (number / 1e9).toFixed(1) + "B";
    if (number >= 1e6) return (number / 1e6).toFixed(1) + "M";
    if (number >= 1e3) return (number / 1e3).toFixed(1) + "K";
    return number.toFixed(0);
  };

  const getPresaleStatus = (presale) => {
    const now = Date.now() / 1000;
    const startTime = new Date(presale.start_time).getTime() / 1000;
    const endTime = new Date(presale.end_time).getTime() / 1000;

    if (!presale.is_active) return "inactive";
    if (now < startTime) return "upcoming";
    if (now > endTime) return "ended";
    return "active";
  };

  const getStatusDisplay = (status) => {
    const statusConfig = {
      active: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="w-3 h-3" />,
        text: t("status.active")
      },
      upcoming: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Calendar className="w-3 h-3" />,
        text: t("status.upcoming")
      },
      ended: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <AlertCircle className="w-3 h-3" />,
        text: t("status.ended")
      },
      inactive: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <AlertCircle className="w-3 h-3" />,
        text: t("status.inactive")
      }
    };
    return statusConfig[status] || statusConfig.inactive;
  };

  const handleBuyClick = (presale) => {
    // Navigate to buy page - since each token has 1 presale, use token ID
    router.push(`/presales/${tokenId}/buy`);
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen pt-[100px] lg:pt-[140px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>

            {/* Content skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-[100px] lg:pt-[140px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("error.title")}</h2>
          <p className="text-gray-600 mb-6">{t("error.message")}</p>
          <button
            onClick={() => refetch()}
            className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            {t("error.retry")}
          </button>
        </div>
      </div>
    );
  }

  const { token, mines, presales, reports, statistics } = tokenData.data;

  const tabs = [
    { id: "overview", label: t("tabs.overview"), icon: BarChart3 },
    { id: "presales", label: t("tabs.presales"), icon: ShoppingCart },
    { id: "mines", label: t("tabs.mines"), icon: Zap },
    { id: "reports", label: t("tabs.reports"), icon: FileText },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        {/* Floating Orbs - Reduced on mobile for performance */}
        <div className="hidden sm:block absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-[#FF5D1B]/20 to-[#FF363E]/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-r from-[#FF363E]/15 to-[#FF5D1B]/15 rounded-full blur-lg animate-bounce"></div>
        <div className="hidden lg:block absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-r from-orange-200/30 to-red-200/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-10 w-20 sm:w-28 h-20 sm:h-28 bg-gradient-to-r from-pink-200/25 to-orange-200/25 rounded-full blur-xl animate-bounce delay-500"></div>

        {/* Grid Pattern - Lighter on mobile */}
        <div className="absolute inset-0 opacity-3 sm:opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #FF5D1B 1px, transparent 0)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
      </div>

      <div className="relative z-10 pt-[80px] lg:pt-[120px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/presales")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            >
              <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
              {t("back")}
            </button>
          </div>

          {/* Header */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 shadow-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-2xl flex items-center justify-center shadow-lg">
                  <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                    {token.token_name}
                  </h1>
                  <div className={`flex flex-wrap items-center gap-2 sm:gap-4 mt-2`}>
                    <span className="text-lg font-semibold text-gray-600">
                      {token.token_symbol}
                    </span>
                    <span className="text-sm text-gray-500 font-mono">
                      {token.token_address.slice(0, 6)}...{token.token_address.slice(-4)}
                    </span>
                    <a
                      href={`https://bscscan.com/address/${token.token_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-[#FF5D1B] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              <button
                onClick={() => refetch()}
                disabled={isRefetching}
                className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg hover:border-[#FF5D1B] transition-all duration-200 shadow-lg cursor-pointer disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{t("refresh")}</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{t("stats.totalMines")}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {statistics.mine_allocation.total_mines}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{t("stats.totalPresales")}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatLargeNumber(statistics.presale_performance.total_sold ? statistics.presale_performance.total_sold : 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{t("stats.totalReports")}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {statistics.transparency.total_reports}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{t("stats.allocation")}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {statistics.mine_allocation.total_allocation_percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex flex-wrap gap-2 sm:space-x-8 px-4 sm:px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 cursor-pointer ${activeTab === tab.id
                        ? "border-[#FF5D1B] text-[#FF5D1B]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 sm:p-6">
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Token Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("overview.tokenInfo")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t("overview.name")}:</span>
                          <span className="font-semibold">{token.token_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t("overview.symbol")}:</span>
                          <span className="font-semibold">{token.token_symbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t("overview.decimals")}:</span>
                          <span className="font-semibold">{token.token_decimals}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{t("overview.address")}:</span>
                          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className="font-mono text-sm">{isRTL ? `...${token.token_address.slice(0, 10)}` : `${token.token_address.slice(0, 10)}...`}</span>
                            <a
                              href={`https://bscscan.com/address/${token.token_address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#FF5D1B] hover:text-[#FF4A0F] transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    {token.token_description && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-900 mb-2">{t("overview.description")}</h4>
                        <p className="text-gray-600">{token.token_description}</p>
                      </div>
                    )}
                  </div>

                  {/* Performance Stats */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("overview.performance")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-900">{t("overview.mineAllocation")}</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900">
                          {statistics.mine_allocation.total_allocation_percentage.toFixed(1)}%
                        </p>
                        <p className="text-sm text-blue-700">
                          {statistics.mine_allocation.active_mines} {t("overview.activeMines")}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-900">{t("overview.presalePerformance")}</span>
                        </div>
                        <p className="text-2xl font-bold text-green-900">
                          {statistics.presale_performance.supply_sold_percentage.toFixed(1)}%
                        </p>
                        <p className="text-sm text-green-700">
                          {formatLargeNumber(statistics.presale_performance.total_sold)} {t("overview.tokensSold")}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-orange-600" />
                          <span className="font-medium text-orange-900">{t("overview.transparency")}</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-900">
                          {statistics.transparency.published_reports}
                        </p>
                        <p className="text-sm text-orange-700">
                          {t("overview.publishedReports")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "presales" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{t("presales.title")}</h3>
                    <span className="text-sm text-gray-500">
                      {presales.count} {t("presales.total")}
                    </span>
                  </div>

                  {presales.presales.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{t("presales.empty.title")}</h3>
                      <p className="text-gray-500">{t("presales.empty.message")}</p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {presales.presales.map((presale) => {
                        const status = getPresaleStatus(presale);
                        const statusDisplay = getStatusDisplay(status);
                        const progress = (parseFloat(presale.total_sold ? presale.total_sold : 0) / parseFloat(presale.total_supply)) * 100;

                        return (
                          <div key={presale.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {t("presales.presaleId")} #{presale.presale_id}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {formatDate(presale.start_time)} - {formatDate(presale.end_time)}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusDisplay.color}`}>
                                  {statusDisplay.icon}
                                  {statusDisplay.text}
                                </span>
                                {status === "active" && (
                                  <button
                                    onClick={() => handleBuyClick(presale)}
                                    className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer"
                                  >
                                    <ShoppingCart className="w-4 h-4" />
                                    {t("presales.buyNow")}
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">{t("presales.price")}</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {formatPrice(presale.price_per_token)} {presale.payment_token.symbol}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-1">{t("presales.totalSupply")}</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {formatLargeNumber(presale.total_supply)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-1">{t("presales.sold")}</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {presale.total_sold ? formatLargeNumber(presale.total_sold) : 0} {progress.toFixed(1)}%
                                </p>
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">{t("presales.progress")}</span>
                                <span className="text-sm font-medium text-gray-900">{progress.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "mines" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{t("mines.title")}</h3>
                    <span className="text-sm text-gray-500">
                      {mines.count} {t("mines.total")}
                    </span>
                  </div>

                  {mines.mines.length === 0 ? (
                    <div className="text-center py-12">
                      <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{t("mines.empty.title")}</h3>
                      <p className="text-gray-500">{t("mines.empty.message")}</p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {mines.mines.map((mine) => (
                        <div key={mine.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{mine.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{mine.location}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-[#FF5D1B]">
                                {mine.allocation_percentage}%
                              </p>
                              <p className="text-sm text-gray-600">{t("mines.allocation")}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">{t("mines.capacity")}</p>
                              <p className="text-lg font-semibold text-gray-900">{mine.capacity} MW</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">{t("mines.status")}</p>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${mine.is_active
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                                }`}>
                                {mine.is_active ? (
                                  <>
                                    <CheckCircle className="w-3 h-3" />
                                    {t("mines.active")}
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-3 h-3" />
                                    {t("mines.inactive")}
                                  </>
                                )}
                              </span>
                            </div>
                          </div>

                          {mine.description && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-600">{mine.description}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reports" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{t("reports.title")}</h3>
                    <span className="text-sm text-gray-500">
                      {reports.count} {t("reports.total")}
                    </span>
                  </div>

                  {reports.reports.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{t("reports.empty.title")}</h3>
                      <p className="text-gray-500">{t("reports.empty.message")}</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {reports.reports.map((report) => (
                        <div key={report.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h4>
                              <p className="text-gray-600 mb-3">{report.description}</p>

                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(report.created_date)}
                                </div>
                                {report.attachments_count > 0 && (
                                  <div className="flex items-center gap-1">
                                    <FileText className="w-4 h-4" />
                                    {report.attachments_count} {t("reports.attachments")}
                                  </div>
                                )}
                              </div>

                              {report.mines_covered.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm text-gray-600 mb-1">{t("reports.minesCovered")}:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {report.mines_covered.map((mine) => (
                                      <span key={mine.id} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        <MapPin className="w-3 h-3" />
                                        {mine.name} ({mine.location})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <button className="ml-4 text-gray-400 hover:text-[#FF5D1B] transition-colors cursor-pointer">
                              <ExternalLink className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
