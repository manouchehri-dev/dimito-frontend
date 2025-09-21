"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { formatDateByLocale } from "@/lib/date";
import { useAccount } from "wagmi";
import { usePaginatedPurchases } from "@/lib/api";
import { useRouter } from "@/i18n/navigation";
import {
    ShoppingBag,
    CheckCircle,
    Clock,
    DollarSign,
    RefreshCw,
    Search,
    Filter,
    Download,
    ArrowLeft,
    ArrowRight,
    ExternalLink,
    TrendingUp
} from "lucide-react";
import Pagination from "./Pagination";
import LoadingSpinner from "./LoadingSpinner";
import ErrorState from "./ErrorState";

export default function PurchasesPage({ onBack }) {
    const t = useTranslations("dashboard.purchases");
    const locale = useLocale();
    const { address } = useAccount();
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const { data, isLoading, error, refetch } = usePaginatedPurchases(address, currentPage);
    const isRTL = locale === "fa";
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

    // Filter purchases based on search and status
    const filteredPurchases = data?.results?.filter(purchase => {
        const matchesSearch = !searchTerm ||
            purchase.token_info?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            purchase.token_info?.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            purchase.purchase_id?.toString().includes(searchTerm);

        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "verified" && purchase.is_verified) ||
            (statusFilter === "pending" && !purchase.is_verified);

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
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 cursor-pointer"
                    >
                        {isRTL ? <ArrowRight className="w-5 h-5 text-gray-600" /> : <ArrowLeft className="w-5 h-5 text-gray-600" />}
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                            <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500" />
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
                                <option value="verified">{t("filters.verified")}</option>
                                <option value="pending">{t("filters.pending")}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Purchases List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {filteredPurchases.length === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">{t("empty")}</p>
                        <p className="text-gray-400 text-sm mt-2">{t("emptyDescription")}</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table Header - Hidden on Mobile */}
                        <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                            <div className="col-span-3 text-sm font-medium text-gray-700">{t("table.token")}</div>
                            <div className="col-span-2 text-sm font-medium text-gray-700">{t("table.amount")}</div>
                            <div className="col-span-2 text-sm font-medium text-gray-700">{t("table.paid")}</div>
                            <div className="col-span-2 text-sm font-medium text-gray-700">{t("table.date")}</div>
                            <div className="col-span-2 text-sm font-medium text-gray-700">{t("table.status")}</div>
                            <div className="col-span-1 text-sm font-medium text-gray-700">{t("table.purchaseId")}</div>
                        </div>

                        {/* Responsive List */}
                        <div className="divide-y divide-gray-200">
                            {filteredPurchases.map((purchase) => (
                                <div key={purchase.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    {/* Desktop Table Row */}
                                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-6">
                                        {/* Token Info - Clickable */}
                                        <div className="col-span-3">
                                            <button
                                                onClick={() => router.push(`/tokens/${purchase.token_info.id}`)}
                                                className={`flex items-center gap-3 w-full text-left p-2 rounded-lg transition-colors duration-200 ${purchase.token_info?.id
                                                    ? 'hover:bg-blue-50 hover:border-blue-200 border border-transparent cursor-pointer'
                                                    : 'cursor-default'
                                                    }`}
                                                disabled={!purchase.token_info?.id}
                                            >
                                                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {purchase.token_info?.symbol?.charAt(0) || 'T'}
                                                </div>
                                                <div className="flex-1 min-w-0 text-start">
                                                    <p className={`font-medium truncate ${purchase.token_info?.id ? 'text-blue-600' : 'text-gray-900'
                                                        }`}>
                                                        {purchase.token_info?.name || purchase.token_info?.symbol}
                                                        {purchase.token_info?.id && <ExternalLink className="w-3 h-3 inline ml-1" />}
                                                    </p>
                                                    <p className="text-sm text-gray-500 font-mono">
                                                        {purchase.token_info?.symbol}
                                                    </p>
                                                </div>
                                            </button>
                                        </div>

                                        {/* Amount Received */}
                                        <div className="col-span-2">
                                            <p className="font-semibold text-gray-900">
                                                {formatNumber(purchase.amount_in_presale_token)}
                                            </p>
                                            <p className="text-sm text-gray-500">{t("table.tokens")}</p>
                                        </div>

                                        {/* Amount Paid */}
                                        <div className="col-span-2">
                                            <p className="font-semibold text-gray-900 flex items-center gap-1">
                                                <DollarSign className="w-4 h-4 text-gray-400" />
                                                {formatCurrency(purchase.amount_in_payment_token)}
                                            </p>
                                            <p className="text-sm text-gray-500">{purchase.payment_token_info?.symbol}</p>
                                        </div>

                                        {/* Date */}
                                        <div className="col-span-2">
                                            <p className="text-gray-900">
                                                {formatDateByLocale(purchase.created_at, locale, 'medium')}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatDateByLocale(purchase.created_at, locale, 'time')}
                                            </p>
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2">
                                                {purchase.is_verified ? (
                                                    <>
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                        <span className="text-sm font-medium text-green-600">
                                                            {t("status.verified")}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock className="w-5 h-5 text-yellow-500" />
                                                        <span className="text-sm font-medium text-yellow-600">
                                                            {t("status.pending")}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Purchase ID */}
                                        <div className="col-span-1">
                                            <span className="text-sm text-gray-500 font-mono">
                                                #{purchase.purchase_id || purchase.id}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Mobile Card */}
                                    <div className="lg:hidden p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <button
                                                onClick={() => purchase.token_info?.id && router.push(`/tokens/${purchase.token_info.id}`)}
                                                className={`flex items-center gap-3 p-2 rounded-lg transition-colors duration-200 ${purchase.token_info?.id
                                                    ? 'hover:bg-blue-50 hover:border-blue-200 border border-transparent cursor-pointer'
                                                    : 'cursor-default border border-transparent'
                                                    }`}
                                                disabled={!purchase.token_info?.id}
                                            >
                                                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {purchase.token_info?.symbol?.charAt(0) || 'T'}
                                                </div>
                                                <div>
                                                    <p className={`font-medium ${purchase.token_info?.id ? 'text-blue-600' : 'text-gray-900'
                                                        }`}>
                                                        {purchase.token_info?.symbol}
                                                        {purchase.token_info?.id && <ExternalLink className="w-3 h-3 inline ml-1" />}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatDateByLocale(purchase.created_at, locale, 'medium')}
                                                    </p>
                                                </div>
                                            </button>

                                            {/* Status Badge */}
                                            <div className="flex items-center gap-1">
                                                {purchase.is_verified ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Clock className="w-4 h-4 text-yellow-500" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                            <div>
                                                <p className="text-gray-500 mb-1">{t("table.amount")}</p>
                                                <p className="font-semibold text-gray-900">
                                                    {formatNumber(purchase.amount_in_presale_token)} {purchase.token_info?.symbol}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1">{t("table.paid")}</p>
                                                <p className="font-semibold text-gray-900">
                                                    ${formatCurrency(purchase.amount_in_payment_token)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Purchase ID for Mobile */}
                                        <div className="pt-2 border-t border-gray-100">
                                            <p className="text-xs text-gray-500">{t("table.purchaseId")}</p>
                                            <p className="text-sm font-mono text-gray-700">#{purchase.purchase_id || purchase.id}</p>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={totalCount}
                            itemsPerPage={10}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
