"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAccount } from "wagmi";
import { usePaginatedPresales } from "@/lib/api";
import { format } from "date-fns";
import { enUS, faIR } from "date-fns/locale";
import { useRouter } from "@/i18n/navigation";
import {
    Rocket,
    CheckCircle,
    Clock,
    X,
    DollarSign,
    RefreshCw,
    Search,
    Filter,
    Download,
    ArrowLeft,
    BarChart3,
    TrendingUp,
    ArrowRight
} from "lucide-react";
import Pagination from "./Pagination";
import LoadingSpinner from "./LoadingSpinner";
import ErrorState from "./ErrorState";

export default function ParticipatedPresalesPage({ onBack }) {
    const t = useTranslations("dashboard.participatedPresales");
    const locale = useLocale();
    const dateLocale = locale === "fa" ? faIR : enUS;
    const { address } = useAccount();
    const isRTL = locale === "fa";
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const { data, isLoading, error, refetch } = usePaginatedPresales(address, currentPage);

    // Format large numbers with K, M, B suffixes
    const formatNumber = (num) => {
        const number = parseFloat(num);
        if (number >= 1e9) return (number / 1e9).toFixed(1) + "B";
        if (number >= 1e6) return (number / 1e6).toFixed(1) + "M";
        if (number >= 1e3) return (number / 1e3).toFixed(1) + "K";
        return number.toFixed(2);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return parseFloat(amount).toLocaleString(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Calculate progress percentage
    const calculateProgress = (sold, total) => {
        if (!sold || !total) return 0;
        return (parseFloat(sold) / parseFloat(total)) * 100;
    };

    // Get presale status
    const getPresaleStatus = (presale) => {
        const now = Date.now() / 1000;
        const startTime = presale.start_unix_timestamp;
        const endTime = presale.end_unix_timestamp;

        if (now < startTime) return "upcoming";
        if (now > endTime) return "ended";
        if (presale.is_active) return "active";
        return "inactive";
    };

    // Get status display info
    const getStatusInfo = (status) => {
        switch (status) {
            case "active":
                return {
                    label: t("status.active"),
                    color: "text-green-600 bg-green-50",
                    icon: CheckCircle
                };
            case "upcoming":
                return {
                    label: t("status.upcoming"),
                    color: "text-blue-600 bg-blue-50",
                    icon: Clock
                };
            case "ended":
                return {
                    label: t("status.ended"),
                    color: "text-gray-600 bg-gray-50",
                    icon: X
                };
            default:
                return {
                    label: t("status.inactive"),
                    color: "text-red-600 bg-red-50",
                    icon: X
                };
        }
    };

    // Filter presales based on search and status
    const filteredPresales = data?.results?.filter(presale => {
        const matchesSearch = !searchTerm ||
            presale.mine_token?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            presale.mine_token?.symbol?.toLowerCase().includes(searchTerm.toLowerCase());

        const presaleStatus = getPresaleStatus(presale);
        const matchesStatus = statusFilter === "all" || statusFilter === presaleStatus;

        return matchesSearch && matchesStatus;
    }) || [];

    if (isLoading && currentPage === 1) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorState error={error} onRetry={refetch} />;
    }

    const totalPages = data?.total_pages || 1;
    const totalCount = data?.count || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        {isRTL ? <ArrowRight className="w-5 h-5 text-gray-600" /> : <ArrowLeft className="w-5 h-5 text-gray-600" />}
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                            <Rocket className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500" />
                            {t("title")}
                        </h1>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">{t("subtitle")}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={refetch}
                        disabled={isLoading}
                        className="bg-white border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">{t("refresh")}</span>
                    </button>

                    <button className="bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">{t("export")}</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder={t("searchPlaceholder")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="sm:w-48">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white"
                            >
                                <option value="all">{t("filters.all")}</option>
                                <option value="active">{t("filters.active")}</option>
                                <option value="upcoming">{t("filters.upcoming")}</option>
                                <option value="ended">{t("filters.ended")}</option>
                                <option value="inactive">{t("filters.inactive")}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Presales Grid */}
            <div className="space-y-6">
                {filteredPresales.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-12">
                        <Rocket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">{t("empty")}</p>
                        <p className="text-gray-400 text-sm mt-2">{t("emptyDescription")}</p>
                    </div>
                ) : (
                    <>
                        {/* Presales Cards */}
                        <div className="grid gap-4 sm:gap-6">
                            {filteredPresales.map((presale) => {
                                const status = getPresaleStatus(presale);
                                const statusInfo = getStatusInfo(status);
                                const StatusIcon = statusInfo.icon;
                                const progress = calculateProgress(presale.total_sold, presale.total_supply);

                                return (
                                    <div
                                        key={presale.id}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200"
                                    >
                                        {/* Presale Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                                                        {presale.mine_token?.symbol?.charAt(0) || 'T'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                                                            {presale.mine_token?.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 font-mono">
                                                            {presale.mine_token?.symbol}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {presale.description}
                                                </p>
                                            </div>

                                            {/* Status Badge */}
                                            <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${statusInfo.color} self-start`}>
                                                <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                                {statusInfo.label}
                                            </div>
                                        </div>

                                        {/* Progress Section */}
                                        <div className="mb-6">
                                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="w-4 h-4" />
                                                    {t("progress")}
                                                </span>
                                                <span className="font-medium">{progress.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full transition-all duration-300"
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                                <span>{formatNumber(presale.total_sold)} {t("sold")}</span>
                                                <span>{formatNumber(presale.total_supply)} {t("total")}</span>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs text-gray-500 mb-1">{t("yourInvestment")}</p>
                                                <p className="font-semibold text-gray-900 flex items-center gap-1">
                                                    <DollarSign className="w-3 h-3 text-gray-400" />
                                                    {formatCurrency(presale.user_participation?.total_invested || 0)}
                                                </p>
                                                <p className="text-xs text-gray-500">{presale.payment_token?.symbol}</p>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs text-gray-500 mb-1">{t("tokensOwned")}</p>
                                                <p className="font-semibold text-gray-900 flex items-center gap-1">
                                                    <BarChart3 className="w-3 h-3 text-gray-400" />
                                                    {formatNumber(presale.user_participation?.total_tokens_purchased || 0)}
                                                </p>
                                                <p className="text-xs text-gray-500">{presale.mine_token?.symbol}</p>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs text-gray-500 mb-1">{t("purchases")}</p>
                                                <p className="font-semibold text-gray-900">
                                                    {presale.user_participation?.purchase_count || 0}
                                                </p>
                                                <p className="text-xs text-gray-500">{t("transactions")}</p>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs text-gray-500 mb-1">{t("price")}</p>
                                                <p className="font-semibold text-gray-900">
                                                    ${parseFloat(presale.price_per_token || 0).toFixed(4)}
                                                </p>
                                                <p className="text-xs text-gray-500">{t("perToken")}</p>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="text-sm text-gray-500">
                                                <p>
                                                    {t("period")}: {format(new Date(presale.start_time), "MMM dd", { locale: dateLocale })} - {format(new Date(presale.end_time), "MMM dd, yyyy", { locale: dateLocale })}
                                                </p>
                                            </div>

                                            {status === "active" ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/tokens/${presale.mine_token.id}`);
                                                        }}
                                                        className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        <span>{t("viewToken")}</span>
                                                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/presales/${presale.id}/buy`);
                                                        }}
                                                        className="flex items-center gap-1 text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200 px-2 py-1 rounded hover:bg-orange-50 cursor-pointer"
                                                    >
                                                        <span>{t("buyNow")}</span>
                                                        {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/tokens/${presale.mine_token.id}`);
                                                    }}
                                                    className="flex items-center gap-1 text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200 px-2 py-1 rounded hover:bg-orange-50 cursor-pointer"
                                                >
                                                    <span>{t("viewToken")}</span>
                                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={totalCount}
                                itemsPerPage={10}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
