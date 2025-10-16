"use client";

import { useTranslations } from "next-intl";
import { User, Phone, Mail, BadgeCheck, Copy } from "lucide-react";
import { useState } from "react";

export default function SSOUserInfoCard({ userInfo }) {
  const t = useTranslations("dashboard");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text) => {
    if (text) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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

  const { username, phone_number, email, first_name, last_name, id } = userInfo;
  const displayName = first_name || phone_number || username;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-orange-500" />
          {t("ssoUserInfo")}
        </h3>
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
            {t("userInfo.active")}
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="space-y-4">
        {/* User Info - Primary Display */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {displayName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900">
              {displayName}
              {last_name && ` ${last_name}`}
            </h4>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">
                {t("userId")} #{id}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {(phone_number || email) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            {phone_number && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {t("phoneNumber")}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {phone_number}
                  </p>
                </div>
              </div>
            )}

            {email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {t("email")}
                  </p>
                  <p className="text-sm font-medium text-gray-900">{email}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SSO Authentication Badge */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <BadgeCheck className="w-5 h-5 text-blue-600" />
          <p className="text-sm text-blue-700">{t("ssoAuthentication")}</p>
        </div>
      </div>
    </div>
  );
}
