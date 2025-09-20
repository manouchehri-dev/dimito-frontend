"use client";

import { useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { X, Wallet, Shield, Zap, Globe, ChevronRight, ChevronLeft, ArrowLeft, Home, ArrowRight } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useRouter } from "@/i18n/navigation";

export default function WalletConnectionModal({ isOpen, onClose }) {
    const t = useTranslations("walletModal");
    const locale = useLocale();
    const isRTL = locale === "fa";
    const modalRef = useRef(null);
    const { openConnectModal } = useConnectModal();
    const { isConnected } = useAccount();
    const router = useRouter();

    // Close modal when wallet is connected
    useEffect(() => {
        if (isConnected && isOpen) {
            onClose();
        }
    }, [isConnected, isOpen, onClose]);

    // Lock body scroll when modal is open (no escape or click outside)
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleConnectWallet = () => {
        openConnectModal?.();
    };

    const handleGoHome = () => {
        router.push("/");
    };

    if (!isOpen) return null;

    const features = [
        {
            icon: Shield,
            title: t("secureAccess"),
            description: t("secureAccessDesc"),
        },
        {
            icon: Zap,
            title: t("instantAccess"),
            description: t("instantAccessDesc"),
        },
        {
            icon: Globe,
            title: t("globalCompatibility"),
            description: t("globalCompatibilityDesc"),
        },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                ref={modalRef}
                className={`relative w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto ${isRTL ? "rtl" : "ltr"
                    }`}
                dir={isRTL ? "rtl" : "ltr"}
            >
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] px-4 sm:px-6 py-6 sm:py-8 text-white">
                    {/* Header content */}
                    <div className="text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 backdrop-blur-sm">
                            <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-2">{t("title")}</h2>
                        <p className="text-white/90 text-xs sm:text-sm leading-relaxed px-2">
                            {t("subtitle")}
                        </p>
                    </div>

                    {/* Decorative elements - smaller on mobile */}
                    <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10 sm:-translate-y-16 sm:translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full translate-y-8 -translate-x-8 sm:translate-y-12 sm:-translate-x-12" />
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                    {/* Primary Action - Connect Wallet at Top */}
                    <div className="mb-6 sm:mb-8">
                        <button
                            onClick={handleConnectWallet}
                            className="w-full bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4A0F] hover:to-[#FF2A2A] text-white font-bold py-4 sm:py-5 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-3 group text-base sm:text-lg cursor-pointer shadow-lg"
                        >
                            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>{t("connectWallet")}</span>
                            {isRTL ? <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" /> : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" />}
                        </button>
                    </div>

                    {/* Main message */}
                    <div className="text-center mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                            {t("accessRequired")}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed px-2">
                            {t("accessRequiredDesc")}
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#FF5D1B]/10 to-[#FF363E]/10 rounded-lg flex items-center justify-center">
                                    <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5D1B]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 text-xs sm:text-sm mb-1">
                                        {feature.title}
                                    </h4>
                                    <p className="text-gray-600 text-xs leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Secondary Action - Go Home */}
                    <div className="text-center">
                        <button
                            onClick={handleGoHome}
                            className="bg-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-800 font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer border border-gray-200 hover:border-gray-300 mx-auto"
                        >
                            {isRTL ? <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" /> : <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />}
                            <span>{t("goToHomepage")}</span>
                        </button>
                    </div>

                    {/* Security note */}
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-start gap-2">
                            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-blue-800 text-xs font-medium mb-1">
                                    {t("securityNote")}
                                </p>
                                <p className="text-blue-700 text-xs leading-relaxed">
                                    {t("securityNoteDesc")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
