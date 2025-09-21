"use client";

import { useTranslations } from "next-intl";
import { BadgeCheck, User, MapPin, Mail, Wallet, Copy } from "lucide-react";
import { useAccount } from "wagmi";
import { useState } from "react";

export default function UserInfoCard({ userInfo }) {
  const t = useTranslations("dashboard");
  const { address: walletAddress } = useAccount();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!userInfo) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { first_name, last_name, email, is_verified, is_active, country, city, address } = userInfo;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-orange-500" />
          {t("userInfo.title")}
        </h3>
        <div className="flex items-center gap-2">
          {/* {is_verified && (
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              <BadgeCheck className="w-4 h-4" />
              {t("userInfo.verified")}
            </div>
          )} */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${is_active
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
            }`}>
            {is_active ? t("userInfo.active") : t("userInfo.inactive")}
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="space-y-4">
        {/* Wallet Address - Primary Display */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            <Wallet className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900">
              {first_name && last_name ? `${first_name} ${last_name}` : t("userInfo.walletUser")}
            </h4>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500 font-mono">
                {truncateAddress(walletAddress)}
              </p>
              <button
                onClick={copyAddress}
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                title={copied ? t("userInfo.copied") : t("userInfo.copyAddress")}
              >
                <Copy className={`w-4 h-4 ${copied ? 'text-green-500' : 'text-gray-400'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Additional Information (Only show if available) */}
        {(email || (country || city)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            {email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t("userInfo.email")}</p>
                  <p className="text-sm font-medium text-gray-900">{email}</p>
                </div>
              </div>
            )}

            {(country || city) && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t("userInfo.location")}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {city && country ? `${city}, ${country}` : city || country}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Completion Notice */}
        {(!first_name || !last_name || !email) && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              {t("userInfo.completeProfile")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
