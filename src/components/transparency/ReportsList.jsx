"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPersianDate } from "@/lib/date";
import { Link } from "@/i18n/navigation";
import AdvancedFilters from "./AdvancedFilters";

/**
 * Reports List Component
 * Displays reports in a beautiful grid layout
 */

export default function ReportsList({
  reports = [],
  isLoading = false,
  onViewReport,
  onFiltersChange,
  filters = {},
  showAdvancedFilters = true,
}) {
  const t = useTranslations("reports");
  const locale = useLocale();
  const isRTL = locale === "fa";

  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [localFilters, setLocalFilters] = useState(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  /**
   * Handle filter changes from AdvancedFilters component
   */
  const handleFiltersChange = (newFilters) => {
    setLocalFilters(newFilters);
  };

  /**
   * Apply filters and notify parent component
   */
  const handleApplyFilters = (appliedFilters) => {
    onFiltersChange?.(appliedFilters);
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4135] mx-auto mb-4"></div>
          <p
            className={cn(
              "text-gray-600",
              isRTL ? "font-iransans" : "font-poppins"
            )}
          >
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3
            className={cn(
              "text-xl font-semibold text-[#2D2D2D] mb-2",
              isRTL ? "font-iransans" : "font-poppins"
            )}
          >
            {t("noReportsFound")}
          </h3>
          <p
            className={cn(
              "text-gray-600",
              isRTL ? "font-iransans" : "font-poppins"
            )}
          >
            {t("noReportsDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <AdvancedFilters
          filters={localFilters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Only show count when filters are applied */}
          {Object.entries(localFilters).some(([key, value]) => {
            const filterFields = ['date_from', 'date_to', 'token', 'author', 'search'];
            return filterFields.includes(key) && value !== null && value !== undefined && value !== "";
          }) && (
              <h2
                className={cn(
                  "text-xl font-semibold text-[#2D2D2D]",
                  isRTL ? "font-iransans" : "font-poppins"
                )}
              >
                {reports.length} {t("reportsFound")}
              </h2>
            )}
        </div>

        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-xl p-1 border border-gray-200">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              viewMode === "grid"
                ? "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white"
                : "text-gray-600 hover:text-[#FF4135]"
            )}
          >
            <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
            </div>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              viewMode === "list"
                ? "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white"
                : "text-gray-600 hover:text-[#FF4135]"
            )}
          >
            <div className="w-4 h-4 flex flex-col gap-0.5">
              <div className="bg-current h-0.5 rounded"></div>
              <div className="bg-current h-0.5 rounded"></div>
              <div className="bg-current h-0.5 rounded"></div>
              <div className="bg-current h-0.5 rounded"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div
        className={cn(
          "grid gap-6",
          viewMode === "grid"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        )}
      >
        {reports.map((report) => (
          <article
            key={report.id}
            className="group relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl motion-reduce:transition-none"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Make the whole card interactive */}
            <Link
              href={`/transparency/reports/${report.id}`}
              aria-label={report.title}
              className="block p-6 pb-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4135] rounded-2xl"
            >
              <header className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center overflow-hidden">
                    {report.token_image ? (
                      <img
                        src={report.token_image}
                        alt={report.token_symbol || ""}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">{report.token_symbol}</span>
                    )}
                  </div>
                  <time className={cn("text-xs text-gray-500")}>
                    {formatPersianDate(report.created_date)}
                  </time>
                </div>
              </header>

              <h3 className={cn(
                "text-lg font-semibold text-[#2D2D2D] mb-2 line-clamp-2 transition-colors duration-200 group-hover:text-[#FF4135] motion-reduce:transition-none"
              )}>
                {report.title}
              </h3>

              <p className="text-gray-600 text-sm line-clamp-3">
                {report.description ? report.description.length > 75 ? report.description.slice(0, 75) + "..." : report.description : "(بدون توضحیات)"}
              </p>
            </Link>

            {/* Corner arrow affordance */}
            <ArrowLeft
              aria-hidden="true"
              className={cn(
                "absolute bottom-3",
                isRTL ? "left-3" : "right-3",
                "text-gray-500 w-5 h-5 transition-all duration-200 group-hover:text-[#FF4135] group-hover:w-6 group-hover:h-6 motion-reduce:transition-none"
              )}
            />
          </article>
        ))}
      </div>
    </div >
  );
}
