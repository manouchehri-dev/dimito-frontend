"use client";

import { useTranslations } from "next-intl";
import { useAccount } from "wagmi";
import useAuthStore from "@/stores/useAuthStore";
import { useDashboardData } from "@/hooks/useDashboardData";
import LoadingSpinner from "@/components/dashboard/LoadingSpinner";
import ErrorState from "@/components/dashboard/ErrorState";
import { RefreshCw, User, Phone, Mail, Calendar, Info } from "lucide-react";

export default function SSODashboardContent() {
  const t = useTranslations("dashboard");
  const { address } = useAccount();
  const { user } = useAuthStore();
  
  // Use wallet address if available, otherwise use user ID or a placeholder for SSO-only users
  const walletAddress = address || user?.id?.toString() || "sso_user";
  const { dashboardData, loading, error, refetch } = useDashboardData(walletAddress, 'sso');

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  // Extract SSO data from the new API structure
  const ssoData = dashboardData?.sso_data;
  const userInfo = ssoData?.user_info;
  const displayName = ssoData?.display_name;
  const message = ssoData?.message;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("welcome")} {displayName || userInfo?.first_name || "User"}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              {t("ssoWelcomeDescription")}
            </p>
          </div>
          <button
            onClick={refetch}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t("refreshData")}
          </button>
        </div>
      </div>

      {/* SSO User Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-3">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t("ssoUserInfo")}</h3>
            <p className="text-gray-600">{t("ssoUserInfoDescription")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{t("username")}</p>
                <p className="text-gray-600">{userInfo?.username || t("notAvailable")}</p>
              </div>
            </div>

            {userInfo?.phone_number && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t("phoneNumber")}</p>
                  <p className="text-gray-600">{userInfo.phone_number}</p>
                </div>
              </div>
            )}

            {userInfo?.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t("email")}</p>
                  <p className="text-gray-600">{userInfo.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{t("userId")}</p>
                <p className="text-gray-600">#{userInfo?.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t("authMethod")}</p>
                <p className="text-gray-600">{t("ssoAuthentication")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Development Notice */}
      {message && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                {t("developmentNotice")}
              </h4>
              <p className="text-sm text-blue-700">{message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="bg-gray-200 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">{t("purchaseHistory")}</h3>
          <p className="text-sm text-gray-600">{t("comingSoon")}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="bg-gray-200 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">{t("presaleParticipation")}</h3>
          <p className="text-sm text-gray-600">{t("comingSoon")}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="bg-gray-200 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">{t("investmentStats")}</h3>
          <p className="text-sm text-gray-600">{t("comingSoon")}</p>
        </div>
      </div>
    </div>
  );
}
