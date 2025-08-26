import { useTranslations } from "next-intl";

export default function ErrorState({ error, onRetry }) {
  const t = useTranslations("dashboard");

  return (
    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
      <div className="text-center py-12">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {t("error.title")}
        </h3>
        <p className="text-gray-600 mb-2 max-w-md mx-auto">
          {t("error.description")}
        </p>

        {/* Error Details */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
          <p className="text-sm text-red-700 font-mono">{error}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRetry}
            className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white px-6 py-3 rounded-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 justify-center"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {t("error.retry")}
          </button>

          <button
            onClick={() => window.location.reload()}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            {t("error.refresh")}
          </button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-6">{t("error.helpText")}</p>
      </div>
    </div>
  );
}
