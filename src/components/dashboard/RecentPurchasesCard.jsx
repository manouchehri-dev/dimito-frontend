"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { formatDateByLocale } from "@/lib/date";
import { useRouter } from "@/i18n/navigation";
import {
    ShoppingBag,
    CheckCircle,
    Clock,
    DollarSign,
    ExternalLink
} from "lucide-react";


export default function RecentPurchasesCard({ recentPurchases = [] }) {
    const t = useTranslations("dashboard");
    const locale = useLocale();
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

    if (!recentPurchases || recentPurchases.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-orange-500" />
                        {t("recentPurchases.title")}
                    </h3>
                </div>
                <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t("recentPurchases.empty")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-orange-500" />
                    {t("recentPurchases.title")}
                </h3>
                <span className="text-sm text-gray-500">
                    {t("recentPurchases.showing", { count: recentPurchases.length })}
                </span>
            </div>

            {/* Purchases List - Compact Design */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentPurchases.slice(0, 5).map((purchase) => (
                    <div
                        key={purchase.id}
                        className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                        onClick={() => router.push("/dashboard/purchases")}
                    >
                        {/* Left: Token Info */}
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                {purchase.token_info?.symbol?.charAt(0) || 'T'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-gray-900 text-sm truncate">
                                        {purchase.token_info?.symbol}
                                    </h4>
                                    {purchase.is_verified ? (
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    ) : (
                                        <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">
                                    {formatDateByLocale(purchase.created_at, locale, 'medium')}
                                </p>
                            </div>
                        </div>

                        {/* Right: Amount */}
                        <div className="text-right">
                            <p className="font-semibold text-gray-900 text-sm">
                                {formatNumber(purchase.amount_in_presale_token)}
                            </p>
                            <p className="text-xs text-gray-500">
                                ${formatCurrency(purchase.amount_in_payment_token)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* View All Link */}
            {recentPurchases.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => router.push("/dashboard/purchases")}
                        className="w-full flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors duration-200 cursor-pointer"
                    >
                        {t("recentPurchases.viewAll")}
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
