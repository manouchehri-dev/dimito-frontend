"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePresaleDetails } from "@/lib/api";
import { useRouter } from "@/i18n/navigation";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseUnits, formatUnits } from "viem";
import toast from "react-hot-toast";
import {
    ArrowLeft,
    AlertCircle,
    Loader2,
    ShoppingCart,
    ArrowRight,
    Clock,
    TrendingUp,
    Users,
    Target,
    Info,
    ExternalLink,
    Calendar,
    DollarSign,
    Coins
} from "lucide-react";

export default function PresaleBuyPage({ preSaleId }) {
    const t = useTranslations("presaleBuy");
    const locale = useLocale();
    const isRTL = locale === "fa";
    const router = useRouter();

    // Wagmi hooks
    const { address, isConnected } = useAccount();
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    // State
    const [paymentAmount, setPaymentAmount] = useState("");

    // API data
    const { data: presale, isLoading, error: apiError, refetch } = usePresaleDetails(preSaleId);

    // Get payment token balance
    const { data: balance } = useBalance({
        address,
        token: presale?.payment_token?.token_address,
        enabled: !!address && !!presale?.payment_token?.token_address,
    });

    // Calculate token amount
    const tokenAmount = useMemo(() => {
        if (!paymentAmount || !presale) return "0";
        return (parseFloat(paymentAmount) / parseFloat(presale.price_per_token)).toFixed(6);
    }, [paymentAmount, presale]);

    // Get presale status
    const getPresaleStatus = (presale) => {
        if (!presale) return "loading";
        const now = Date.now() / 1000;
        if (!presale.is_active) return "inactive";
        if (now < presale.start_unix_timestamp) return "upcoming";
        if (now > presale.end_unix_timestamp) return "ended";
        return "active";
    };

    const status = getPresaleStatus(presale);

    // Calculate progress and stats
    const progress = useMemo(() => {
        if (!presale) return 0;
        const sold = parseFloat(presale.total_sold || 0);
        const total = parseFloat(presale.total_supply || 0);
        return total > 0 ? (sold / total) * 100 : 0;
    }, [presale]);

    const remainingSupply = useMemo(() => {
        if (!presale) return 0;
        return parseFloat(presale.total_supply || 0) - parseFloat(presale.total_sold || 0);
    }, [presale]);

    const formatNumber = (num) => {
        if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toFixed(0);
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Validation
    const validationError = useMemo(() => {
        if (!isConnected) return t("errors.walletNotConnected");
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) return t("errors.invalidAmount");
        if (balance && parseFloat(paymentAmount) > parseFloat(formatUnits(balance.value, balance.decimals))) {
            return t("errors.insufficientBalance");
        }
        const remainingSupply = parseFloat(presale?.total_supply || 0) - parseFloat(presale?.total_sold || 0);
        if (parseFloat(tokenAmount) > remainingSupply) return t("errors.exceedsSupply");
        return null;
    }, [isConnected, paymentAmount, tokenAmount, balance, presale, t]);

    // Handle purchase
    const handlePurchase = async () => {
        if (validationError) {
            toast.error(validationError);
            return;
        }

        try {
            toast.success(t("messages.purchaseImplemented"));
            setPaymentAmount("");
        } catch (error) {
            console.error("Purchase error:", error);
            toast.error(t("messages.purchaseFailed"));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
                <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-20 bg-gray-200 rounded-xl"></div>
                        <div className="h-12 bg-gray-200 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (apiError || !presale) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
                <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t("error.title")}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {t("error.subtitle")}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push("/presales")}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
                        >
                            {t("buttons.backToPresales")}
                        </button>
                        <button
                            onClick={() => refetch()}
                            className="flex-1 bg-[#FF5D1B] hover:bg-[#FF4A0F] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
                        >
                            {t("buttons.tryAgain")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
                    {/* Header */}
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
                        <button
                            onClick={() => router.push("/presales")}
                            className="p-2 sm:p-3 hover:bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation cursor-pointer"
                        >
                            {isRTL ? <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" /> : <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />}
                        </button>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 truncate">
                                {t("title")}
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base lg:text-lg truncate">
                                {presale.mine_token.token_name}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {/* Main Trading Card */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 shadow-2xl overflow-hidden">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] p-4 sm:p-6 text-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/10"></div>
                                    <div className="relative z-10">
                                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">
                                            {t("header.buy")} {presale.mine_token.token_symbol}
                                        </h2>
                                        <p className="text-white/90 text-xs sm:text-sm lg:text-base">
                                            {t("header.price")}: {parseFloat(presale.price_per_token).toFixed(6)} {presale.payment_token.token_symbol} {t("header.perToken")}
                                        </p>
                                    </div>
                                    {/* Decorative Elements */}
                                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
                                </div>

                                <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                                    {/* Pay Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                {t("sections.youPay")}
                                            </span>
                                            {balance && (
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full truncate max-w-[120px] sm:max-w-none">
                                                    {t("sections.balance")}: {parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-5 border-2 border-gray-200 focus-within:border-[#FF5D1B] focus-within:shadow-lg transition-all duration-300">
                                            <div className="flex items-center justify-between">
                                                <input
                                                    type="number"
                                                    value={paymentAmount}
                                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                                    placeholder="0.0"
                                                    className="bg-transparent text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 placeholder-gray-400 outline-none flex-1"
                                                />
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                                                        <span className="text-sm sm:text-lg font-bold text-yellow-900">$</span>
                                                    </div>
                                                    <div className="text-right min-w-0">
                                                        <div className="font-bold text-gray-900 text-sm sm:text-lg truncate">{presale.payment_token.token_symbol}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Arrow Divider */}
                                    <div className="flex justify-center">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Receive Section */}
                                    <div className="space-y-4">
                                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Coins className="w-4 h-4" />
                                            {t("sections.youReceive")}
                                        </span>
                                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 border-2 border-orange-200">
                                            <div className="flex items-center justify-between">
                                                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                                                    {paymentAmount ? tokenAmount : "0.0"}
                                                </div>
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-full flex items-center justify-center shadow-lg">
                                                        <span className="text-sm sm:text-lg font-bold text-white">
                                                            {presale.mine_token.token_symbol.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div className="text-right min-w-0">
                                                        <div className="font-bold text-gray-900 text-sm sm:text-lg truncate">{presale.mine_token.token_symbol}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Amount Buttons */}
                                    {balance && (
                                        <div className="grid grid-cols-4 gap-2 sm:gap-3">
                                            {[25, 50, 75, 100].map((percentage) => (
                                                <button
                                                    key={percentage}
                                                    onClick={() => {
                                                        const maxAmount = parseFloat(formatUnits(balance.value, balance.decimals));
                                                        const amount = (maxAmount * percentage / 100).toFixed(6);
                                                        setPaymentAmount(amount);
                                                    }}
                                                    className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-[#FF5D1B] bg-gradient-to-r from-[#FF5D1B]/10 to-[#FF363E]/10 hover:from-[#FF5D1B]/20 hover:to-[#FF363E]/20 rounded-lg sm:rounded-xl transition-all duration-200 hover:shadow-md border border-[#FF5D1B]/20 touch-manipulation cursor-pointer"
                                                >
                                                    {percentage}%
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Buy Button */}
                                    <div className="pt-2 sm:pt-4">
                                        {!isConnected ? (
                                            <ConnectButton.Custom>
                                                {({ openConnectModal }) => (
                                                    <button
                                                        onClick={openConnectModal}
                                                        className="w-full bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4A0F] hover:to-[#FF2A2A] text-white font-bold py-4 sm:py-5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02] text-base sm:text-lg touch-manipulation cursor-pointer"
                                                    >
                                                        {t("buttons.connectWallet")}
                                                    </button>
                                                )}
                                            </ConnectButton.Custom>
                                        ) : status !== "active" ? (
                                            <button
                                                disabled
                                                className="w-full bg-gray-300 text-gray-500 font-bold py-4 sm:py-5 rounded-xl sm:rounded-2xl cursor-not-allowed text-base sm:text-lg"
                                            >
                                                {status === "upcoming" ? t("status.notStarted") :
                                                    status === "ended" ? t("status.ended") : t("status.inactive")}
                                            </button>
                                        ) : validationError ? (
                                            <button
                                                disabled
                                                className="w-full bg-red-100 text-red-600 font-bold py-4 sm:py-5 rounded-xl sm:rounded-2xl cursor-not-allowed text-base sm:text-lg border-2 border-red-200"
                                            >
                                                {validationError}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handlePurchase}
                                                disabled={isPending || isConfirming}
                                                className="w-full bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4A0F] hover:to-[#FF2A2A] text-white font-bold py-4 sm:py-5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg transform hover:scale-[1.02] touch-manipulation cursor-pointer"
                                            >
                                                {isPending || isConfirming ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                                                        {t("buttons.confirming")}
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                                                        {t("buttons.buyNow")}
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Information */}
                        <div className="space-y-4 sm:space-y-6">
                            {/* Presale Progress */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 shadow-xl p-4 sm:p-6">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5D1B]" />
                                    {t("sidebar.presaleProgress")}
                                </h3>
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">{t("sidebar.progress")}</span>
                                        <span className="text-sm font-semibold text-gray-900">{progress.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                                        <div
                                            className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center">
                                        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3">
                                            <div className="text-xs text-gray-500 mb-1">{t("sidebar.sold")}</div>
                                            <div className="font-bold text-gray-900 text-sm sm:text-base">{formatNumber(parseFloat(presale?.total_sold || 0))}</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3">
                                            <div className="text-xs text-gray-500 mb-1">{t("sidebar.remaining")}</div>
                                            <div className="font-bold text-gray-900 text-sm sm:text-base">{formatNumber(remainingSupply)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Presale Details */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 shadow-xl p-4 sm:p-6">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5D1B]" />
                                    {t("sidebar.presaleDetails")}
                                </h3>
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 sm:gap-2">
                                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span className="hidden sm:inline">{t("sidebar.startTime")}</span>
                                            <span className="sm:hidden">{t("sidebar.start")}</span>
                                        </span>
                                        <span className="text-xs sm:text-sm font-medium text-gray-900 text-right">
                                            {formatDate(presale?.start_unix_timestamp)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 sm:gap-2">
                                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span className="hidden sm:inline">{t("sidebar.endTime")}</span>
                                            <span className="sm:hidden">{t("sidebar.end")}</span>
                                        </span>
                                        <span className="text-xs sm:text-sm font-medium text-gray-900 text-right">
                                            {formatDate(presale?.end_unix_timestamp)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 sm:gap-2">
                                            <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span className="hidden sm:inline">{t("sidebar.totalSupply")}</span>
                                            <span className="sm:hidden">{t("sidebar.supply")}</span>
                                        </span>
                                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                                            {formatNumber(parseFloat(presale?.total_supply || 0))}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 sm:gap-2">
                                            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                            {t("sidebar.purchases")}
                                        </span>
                                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                                            {presale?.total_purchases || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Token Information */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 shadow-xl p-4 sm:p-6">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                    <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5D1B]" />
                                    {t("sidebar.tokenInfo")}
                                </h3>
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                        <div className="text-xs text-gray-500 mb-1">{t("sidebar.tokenName")}</div>
                                        <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">{presale?.mine_token?.token_name}</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                        <div className="text-xs text-gray-500 mb-1">{t("sidebar.symbol")}</div>
                                        <div className="font-semibold text-gray-900 text-sm sm:text-base">{presale?.mine_token?.token_symbol}</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                        <div className="text-xs text-gray-500 mb-1">{t("sidebar.contractAddress")}</div>
                                        <div className="font-mono text-xs text-gray-700 break-all">
                                            {presale?.mine_token?.token_address}
                                        </div>
                                        <a
                                            href={`https://bscscan.com/address/${presale?.mine_token?.token_address}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-[#FF5D1B] hover:text-[#FF4A0F] mt-2 touch-manipulation"
                                        >
                                            <span className="hidden sm:inline">{t("sidebar.viewOnBSCScan")}</span>
                                            <span className="sm:hidden">{t("sidebar.bscscan")}</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
