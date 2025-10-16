"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { formatDateByLocale } from "@/lib/date";
import { useAccount } from "wagmi";
import { usePaginatedPurchases } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import useAuthStore from "@/stores/useAuthStore";
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
    TrendingUp,
    Wallet,
    User,
    ArrowUpRight,
    ArrowDownLeft,
    ArrowRightLeft,
    XCircle,
    Copy,
    Check
} from "lucide-react";
import Pagination from "./Pagination";
import LoadingSpinner from "./LoadingSpinner";
import ErrorState from "./ErrorState";
import Tooltip from "../ui/Tooltip";

export default function PurchasesPage({ onBack }) {
    const t = useTranslations("dashboard.purchases");
    const tCommon = useTranslations("dashboard");
    const tTx = useTranslations("dashboard.transactions");
    const locale = useLocale();
    const { address, isConnected } = useAccount();
    const { isAuthenticated, authMethod, user } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [copiedId, setCopiedId] = useState(null);
    
    // Get active tab from URL params
    const [activeTab, setActiveTab] = useState(() => {
        const urlTab = searchParams.get('tab');
        if (urlTab) return urlTab;
        // Smart default: prefer wallet if connected, otherwise SSO if authenticated
        if (isConnected && address) return 'wallet';
        if (isAuthenticated && authMethod === 'sso') return 'sso';
        return 'wallet';
    });

    // Determine which identifier to use for API calls
    const walletAddress = address || user?.id?.toString() || "";
    
    const { data, isLoading, error, refetch } = usePaginatedPurchases(walletAddress, currentPage, activeTab);
    const isRTL = locale === "fa";
    // Format large numbers with K, M, B suffixes
    const formatNumber = (num) => {
        const number = parseFloat(num);
        if (number >= 1e9) return (number / 1e9).toFixed(1) + "B";
        if (number >= 1e6) return (number / 1e6).toFixed(1) + "M";
        if (number >= 1e3) return (number / 1e3).toFixed(1) + "K";
        return number.toFixed(2);
    };

    // Smart decimal formatting for amounts
    const formatAmount = (num) => {
        const number = parseFloat(num);
        if (isNaN(number)) return "0";
        // Below 1: show 4 decimals, Above or equal to 1: show 2 decimals
        return number < 1 ? number.toFixed(4) : number.toFixed(2);
    };

    // Copy track ID to clipboard
    const copyTrackId = async (trackId) => {
        try {
            await navigator.clipboard.writeText(trackId);
            setCopiedId(trackId);
            setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return parseFloat(amount).toLocaleString(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Handle tab change
    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        setCurrentPage(1); // Reset to page 1
        setSearchTerm(""); // Reset search
        setStatusFilter("all"); // Reset filter
        
        const params = new URLSearchParams(searchParams);
        params.set('tab', newTab);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    // Sync tab with URL params
    useEffect(() => {
        const urlTab = searchParams.get('tab');
        if (urlTab && urlTab !== activeTab) {
            setActiveTab(urlTab);
        }
    }, [searchParams, activeTab]);

    // Get transaction type display
    const getTypeDisplay = (type) => {
        const typeMap = {
            Deposit: { label: tTx("typeDeposit"), icon: ArrowDownLeft, color: "text-green-600" },
            Withdrawal: { label: tTx("typeWithdrawal"), icon: ArrowUpRight, color: "text-red-600" },
            Cash_deposit: { label: tTx("typeCashDeposit"), icon: ArrowDownLeft, color: "text-blue-600" },
            Transfer: { label: tTx("typeTransfer"), icon: ArrowRightLeft, color: "text-purple-600" },
        };
        return typeMap[type] || { label: type, icon: ArrowRightLeft, color: "text-gray-600" };
    };

    // Filter data based on active tab, search, and status
    const filteredData = data?.results?.filter(item => {
        if (activeTab === 'wallet') {
            // Filter purchases
            const matchesSearch = !searchTerm ||
                item.token_info?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.token_info?.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.purchase_id?.toString().includes(searchTerm);

            const matchesStatus = statusFilter === "all" ||
                (statusFilter === "verified" && item.is_verified) ||
                (statusFilter === "pending" && !item.is_verified);

            return matchesSearch && matchesStatus;
        } else {
            // Filter transactions
            const matchesSearch = !searchTerm ||
                item.track_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.origin_unit?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === "all" ||
                (statusFilter === "success" && item.status?.toLowerCase() === "success") ||
                (statusFilter === "pending" && item.status?.toLowerCase() === "pending") ||
                (statusFilter === "failed" && item.status?.toLowerCase() === "failed");

            return matchesSearch && matchesStatus;
        }
    }) || [];

    if (isLoading && currentPage === 1) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorState error={error} onRetry={refetch} />;
    }

    const totalCount = data?.count || 0;
    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Determine available tabs
    const availableTabs = [];
    if (isConnected && address) {
        availableTabs.push({ id: 'wallet', label: tCommon('walletTab'), icon: Wallet });
    }
    if (isAuthenticated && authMethod === 'sso') {
        availableTabs.push({ id: 'sso', label: tCommon('ssoTab'), icon: User });
    }

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
                            {activeTab === 'wallet' ? t("title") : tTx("title")}
                        </h1>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">
                            {activeTab === 'wallet' ? t("subtitle") : tTx("description")}
                        </p>
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

            {/* Tab Navigation */}
            {availableTabs.length > 1 && (
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {availableTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`
                                        group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                                        ${isActive
                                            ? 'border-orange-500 text-orange-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <Icon className={`
                                        w-5 h-5 mr-2 transition-colors duration-200
                                        ${isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'}
                                    `} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder={activeTab === 'wallet' ? t("searchPlaceholder") : tTx("searchTransactions")}
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
                                {activeTab === 'wallet' ? (
                                    <>
                                        <option value="all">{t("filters.all")}</option>
                                        <option value="verified">{t("filters.verified")}</option>
                                        <option value="pending">{t("filters.pending")}</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="all">{tTx("allTypes")}</option>
                                        <option value="success">{tTx("statusSuccess")}</option>
                                        <option value="pending">{tTx("statusPending")}</option>
                                        <option value="failed">{tTx("statusFailed")}</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {filteredData.length === 0 ? (
                    <div className="text-center py-12">
                        {activeTab === 'wallet' ? (
                            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        ) : (
                            <ArrowRightLeft className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        )}
                        <p className="text-gray-500 text-lg">
                            {activeTab === 'wallet' ? t("empty") : tTx("noTransactions")}
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                            {activeTab === 'wallet' ? t("emptyDescription") : tTx("noTransactionsDescription")}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table Header - Hidden on Mobile */}
                        <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                            {activeTab === 'wallet' ? (
                                <>
                                    <div className="col-span-3 text-sm font-medium text-gray-700">{t("table.token")}</div>
                                    <div className="col-span-2 text-sm font-medium text-gray-700">{t("table.amount")}</div>
                                    <div className="col-span-2 text-sm font-medium text-gray-700">{t("table.paid")}</div>
                                    <div className="col-span-2 text-sm font-medium text-gray-700">{t("table.date")}</div>
                                    <div className="col-span-2 text-sm font-medium text-gray-700">{t("table.status")}</div>
                                    <div className="col-span-1 text-sm font-medium text-gray-700">{t("table.purchaseId")}</div>
                                </>
                            ) : (
                                <>
                                    <div className="col-span-3 text-sm font-medium text-gray-700">{tTx("type")}</div>
                                    <div className="col-span-2 text-sm font-medium text-gray-700">{tTx("amount")}</div>
                                    <div className="col-span-2 text-sm font-medium text-gray-700">{tTx("fee")}</div>
                                    <div className="col-span-2 text-sm font-medium text-gray-700">{tTx("date")}</div>
                                    <div className="col-span-2 text-sm font-medium text-gray-700">{tTx("status")}</div>
                                    <div className="col-span-1 text-sm font-medium text-gray-700">{tTx("trackId")}</div>
                                </>
                            )}
                        </div>

                        {/* Responsive List */}
                        <div className="divide-y divide-gray-200">
                            {activeTab === 'wallet' ? filteredData.map((purchase) => (
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
                            )) : filteredData.map((tx) => {
                                const typeDisplay = getTypeDisplay(tx.type);
                                const TypeIcon = typeDisplay.icon;
                                const statusIcon = tx.status?.toLowerCase() === 'success' ? CheckCircle : 
                                                   tx.status?.toLowerCase() === 'pending' ? Clock : XCircle;
                                const statusColor = tx.status?.toLowerCase() === 'success' ? 'text-green-600' : 
                                                    tx.status?.toLowerCase() === 'pending' ? 'text-yellow-600' : 'text-red-600';

                                return (
                                    <div key={tx.id} className="hover:bg-gray-50 transition-colors duration-200">
                                        {/* Desktop Table Row */}
                                        <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-6">
                                            {/* Transaction Type */}
                                            <div className="col-span-3 flex items-center gap-3">
                                                <div className={`p-2 rounded-full bg-gray-100 ${typeDisplay.color}`}>
                                                    <TypeIcon className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-gray-900">{typeDisplay.label}</span>
                                            </div>

                                            {/* Amount */}
                                            <div className="col-span-2">
                                                <Tooltip content={`${tTx("exactAmount")}: ${tx.amount} ${tx.origin_unit}`}>
                                                    <p className="font-semibold text-gray-900 cursor-help">
                                                        {formatAmount(tx.amount)} {tx.origin_unit}
                                                    </p>
                                                </Tooltip>
                                            </div>

                                            {/* Fee */}
                                            <div className="col-span-2">
                                                <Tooltip content={`${tTx("exactAmount")}: ${tx.tax} IRR`}>
                                                    <p className="text-gray-900 cursor-help">
                                                        {formatAmount(tx.tax)} IRR
                                                    </p>
                                                </Tooltip>
                                            </div>

                                            {/* Date */}
                                            <div className="col-span-2">
                                                <p className="text-gray-900">
                                                    {formatDateByLocale(tx.date, locale, 'medium')}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {formatDateByLocale(tx.date, locale, 'time')}
                                                </p>
                                            </div>

                                            {/* Status */}
                                            <div className="col-span-2">
                                                <div className="flex items-center gap-2">
                                                    {React.createElement(statusIcon, { className: `w-5 h-5 ${statusColor}` })}
                                                    <span className={`text-sm font-medium ${statusColor}`}>
                                                        {tTx(`status${tx.status?.charAt(0).toUpperCase() + tx.status?.slice(1)}`)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Track ID */}
                                            <div className="col-span-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs text-gray-500 font-mono truncate">
                                                        {tx.track_id?.slice(0, 8)}...
                                                    </span>
                                                    <Tooltip content={copiedId === tx.track_id ? tTx("copied") : tTx("copyTrackId")}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyTrackId(tx.track_id);
                                                            }}
                                                            className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                                                        >
                                                            {copiedId === tx.track_id ? (
                                                                <Check className="w-3 h-3 text-green-600" />
                                                            ) : (
                                                                <Copy className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                                                            )}
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile Card */}
                                        <div className="lg:hidden p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-full bg-gray-100 ${typeDisplay.color}`}>
                                                        <TypeIcon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{typeDisplay.label}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {formatDateByLocale(tx.date, locale, 'medium')}
                                                        </p>
                                                    </div>
                                                </div>
                                                {React.createElement(statusIcon, { className: `w-4 h-4 ${statusColor}` })}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                                <div>
                                                    <p className="text-gray-500 mb-1">{tTx("amount")}</p>
                                                    <Tooltip content={`${tTx("exactAmount")}: ${tx.amount} ${tx.origin_unit}`}>
                                                        <p className="font-semibold text-gray-900 cursor-help">
                                                            {formatAmount(tx.amount)} {tx.origin_unit}
                                                        </p>
                                                    </Tooltip>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 mb-1">{tTx("fee")}</p>
                                                    <Tooltip content={`${tTx("exactAmount")}: ${tx.tax} IRR`}>
                                                        <p className="font-semibold text-gray-900 cursor-help">
                                                            {formatAmount(tx.tax)} IRR
                                                        </p>
                                                    </Tooltip>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-gray-100">
                                                <p className="text-xs text-gray-500 mb-1">{tTx("trackId")}</p>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-mono text-gray-700 truncate">
                                                        {tx.track_id}
                                                    </span>
                                                    <Tooltip content={copiedId === tx.track_id ? tTx("copied") : tTx("copyId")}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyTrackId(tx.track_id);
                                                            }}
                                                            className="flex-shrink-0 p-1.5 hover:bg-gray-100 rounded transition-colors duration-200"
                                                        >
                                                            {copiedId === tx.track_id ? (
                                                                <Check className="w-4 h-4 text-green-600" />
                                                            ) : (
                                                                <Copy className="w-4 h-4 text-gray-400" />
                                                            )}
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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
