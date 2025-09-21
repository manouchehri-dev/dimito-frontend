"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { enUS, faIR } from "date-fns/locale";
import {
    Rocket,
    CheckCircle,
    Clock,
    X,
    DollarSign,
    ExternalLink,
    BarChart3
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";

export default function ParticipatedPresalesCard({ participatedPresales = [] }) {
    const t = useTranslations("dashboard");
    const locale = useLocale();
    const dateLocale = locale === "fa" ? faIR : enUS;
    const router = useRouter();

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

    // Calculate presale progress
    const calculateProgress = (totalSold, totalSupply) => {
        const sold = parseFloat(totalSold);
        const supply = parseFloat(totalSupply);
        return supply > 0 ? (sold / supply) * 100 : 0;
    };

    // Get presale status
    const getPresaleStatus = (presale) => {
        const now = Date.now() / 1000; // Current Unix timestamp
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
                    label: t("participatedPresales.status.active"),
                    color: "text-green-600 bg-green-50",
                    icon: CheckCircle
                };
            case "upcoming":
                return {
                    label: t("participatedPresales.status.upcoming"),
                    color: "text-blue-600 bg-blue-50",
                    icon: Clock
                };
            case "ended":
                return {
                    label: t("participatedPresales.status.ended"),
                    color: "text-gray-600 bg-gray-50",
                    icon: X
                };
            default:
                return {
                    label: t("participatedPresales.status.inactive"),
                    color: "text-red-600 bg-red-50",
                    icon: X
                };
        }
    };

    if (!participatedPresales || participatedPresales.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-orange-500" />
                        {t("participatedPresales.title")}
                    </h3>
                </div>
                <div className="text-center py-8">
                    <Rocket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t("participatedPresales.empty")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-orange-500" />
                    {t("participatedPresales.title")}
                </h3>
                <span className="text-sm text-gray-500">
                    {t("participatedPresales.showing", { count: participatedPresales.length })}
                </span>
            </div>

            {/* Presales List - Compact Design */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
                {participatedPresales.slice(0, 4).map((presale) => {
                    const status = getPresaleStatus(presale);
                    const statusInfo = getStatusInfo(status);
                    const StatusIcon = statusInfo.icon;
                    const progress = calculateProgress(presale.total_sold, presale.total_supply);

                    return (
                        <div
                            key={presale.id}
                            className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                            onClick={() => router.push("/dashboard/participated-presales")}
                        >
                            {/* Top Row: Token Info & Status */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                        {presale.mine_token?.symbol?.charAt(0) || 'T'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 text-sm truncate">
                                            {presale.mine_token?.symbol}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            {progress.toFixed(1)}% {t("participatedPresales.progress")}
                                        </p>
                                    </div>
                                </div>

                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {statusInfo.label}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-3">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className="bg-gradient-to-r from-orange-400 to-red-500 h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Bottom Row: Investment & Tokens */}
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1 text-gray-600">
                                    <DollarSign className="w-3 h-3" />
                                    <span>{formatCurrency(presale.user_participation?.total_invested || 0)} {presale.payment_token?.symbol}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <BarChart3 className="w-3 h-3" />
                                    <span>{formatNumber(presale.user_participation?.total_tokens_purchased || 0)} {t("participatedPresales.tokensOwned")}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* View All Link */}
            {participatedPresales.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => router.push("/dashboard/participated-presales")}
                        className="w-full flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors duration-200 cursor-pointer"
                    >
                        {t("participatedPresales.viewAll")}
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
