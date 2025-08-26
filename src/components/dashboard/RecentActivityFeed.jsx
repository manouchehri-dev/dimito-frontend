import { useTranslations } from "next-intl";

export default function RecentActivityFeed({ recentActivity }) {
  const t = useTranslations("dashboard");

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatTokenAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusIcon = (isVerified) => {
    if (isVerified) {
      return (
        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-3 h-3 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg
            className="w-3 h-3 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      );
    }
  };

  if (!recentActivity || recentActivity.length === 0) {
    return (
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-primary mb-6">
          {t("recentActivity.title")}
        </h2>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">
            {t("recentActivity.noActivity")}
          </h3>
          <p className="text-xs text-gray-500">
            {t("recentActivity.noActivityDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-primary">
          {t("recentActivity.title")}
        </h2>
        <span className="text-sm text-gray-500">
          {recentActivity.length} {t("recentActivity.recent")}
        </span>
      </div>

      <div className="space-y-4">
        {recentActivity.map((activity, index) => (
          <div
            key={`${activity.presale_id}-${index}`}
            className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            {/* Status Icon */}
            <div className="flex-shrink-0 mt-1">
              {getStatusIcon(activity.is_verified)}
            </div>

            {/* Activity Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {t("recentActivity.purchased")} {activity.token_symbol}
                  </h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="font-medium">
                        +{formatTokenAmount(activity.amount_purchased)}{" "}
                        {activity.token_symbol}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>{formatCurrency(activity.amount_spent)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(activity.purchase_date)}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {activity.is_verified ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {t("recentActivity.verified")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {t("recentActivity.pending")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center mt-6">
        <button className="text-sm text-[#FF5D1B] hover:text-[#FF363E] font-medium transition-colors duration-200">
          {t("recentActivity.viewAll")}
        </button>
      </div>
    </div>
  );
}
