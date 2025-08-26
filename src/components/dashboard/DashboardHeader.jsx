import { useTranslations } from "next-intl";

export default function DashboardHeader({ userAddress, overview }) {
  const t = useTranslations("dashboard");

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-gray-100">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-primary">
              {t("welcome")}
            </h1>
            <p className="text-gray-600 font-mono text-sm">
              {formatAddress(userAddress)}
            </p>
          </div>
        </div>

        {/* Quick Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg lg:text-xl font-bold text-primary">
              {formatCurrency(overview?.total_spent)}
            </div>
            <div className="text-xs text-gray-600">{t("totalSpent")}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg lg:text-xl font-bold text-primary">
              {overview?.tokens_held || 0}
            </div>
            <div className="text-xs text-gray-600">{t("tokensHeld")}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg lg:text-xl font-bold text-primary">
              {overview?.total_presales_participated || 0}
            </div>
            <div className="text-xs text-gray-600">{t("presales")}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg lg:text-xl font-bold text-green-600">
              {overview?.verification_rate?.toFixed(1) || 0}%
            </div>
            <div className="text-xs text-gray-600">{t("verified")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
