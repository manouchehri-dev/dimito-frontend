"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-auto text-center px-6">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {t?.("notFound.title") || "Page Not Found"}
          </h2>
          <p className="text-gray-600 mb-8">
            {t?.("notFound.description") ||
              "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."}
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {t?.("notFound.actions.goHome") || "Back to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
