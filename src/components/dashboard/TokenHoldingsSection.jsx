import { useTranslations } from "next-intl";

export default function TokenHoldingsSection({ tokenHoldings, onTokenClick }) {
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

  const calculateAveragePrice = (totalSpent, totalAmount) => {
    if (!totalAmount || totalAmount === 0) return 0;
    return totalSpent / totalAmount;
  };

  if (!tokenHoldings || tokenHoldings.length === 0) {
    return (
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-primary mb-6">
          {t("tokenHoldings.title")}
        </h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("tokenHoldings.noTokens")}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {t("tokenHoldings.noTokensDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-primary">
          {t("tokenHoldings.title")}
        </h2>
        <span className="text-sm text-gray-500">
          {tokenHoldings.length} {t("tokenHoldings.tokens")}
        </span>
      </div>

      <div className="space-y-4">
        {tokenHoldings.map((holding, index) => {
          const avgPrice = calculateAveragePrice(
            holding.total_spent,
            holding.total_amount
          );

          return (
            <div
              key={holding.token.token_address || index}
              className="border border-gray-200 rounded-[16px] p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => onTokenClick?.(holding.token.token_symbol)}
            >
              {/* Token Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {holding.token.token_symbol.substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#FF5D1B] transition-colors">
                      {holding.token.token_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {holding.token.token_symbol}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {formatTokenAmount(holding.total_amount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {holding.token.token_symbol}
                  </div>
                </div>
              </div>

              {/* Token Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600 mb-1">
                    {t("tokenHoldings.totalSpent")}
                  </div>
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(holding.total_spent)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600 mb-1">
                    {t("tokenHoldings.avgPrice")}
                  </div>
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(avgPrice)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 hidden lg:block">
                  <div className="text-sm text-gray-600 mb-1">
                    {t("tokenHoldings.address")}
                  </div>
                  <div className="font-mono text-xs text-gray-900">
                    {holding.token.token_address.slice(0, 6)}...
                    {holding.token.token_address.slice(-4)}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {t("tokenHoldings.clickToView")}
                </span>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-[#FF5D1B] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
