"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

export default function Error({ error, reset }) {
  const t = useTranslations("tokenDetails");
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Token details page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen pt-[100px] lg:pt-[140px] flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t("error.title")}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {t("error.message")}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            {t("error.retry")}
          </button>
          
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:border-[#FF5D1B] hover:text-[#FF5D1B] transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
        
        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development)
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs text-gray-800 overflow-auto">
              {error?.message || "Unknown error"}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
