"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Grid3X3,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPersianDate } from "@/lib/date";
import { Link } from "@/i18n/navigation";

/**
 * Minimal Reports List Component
 * Optimized for thousands of reports with pagination
 */
export default function ReportsList({
  reports = [],
  isLoading = false,
  pagination = null,
  onPageChange = null,
}) {
  const t = useTranslations("reports");
  const locale = useLocale();
  const isRTL = locale === "fa";
  const [viewMode, setViewMode] = useState("compact"); // compact, list

  const formatFileSize = (bytes) => {
    if (bytes === 0) return isRTL ? "0 بایت" : "0 Bytes";
    const k = 1024;
    const sizes = isRTL
      ? ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"]
      : ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text) return isRTL ? "بدون توضیحات" : "No description";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Pagination component
  const Pagination = () => {
    if (!pagination || !onPageChange) return null;

    const { count, next, previous } = pagination;
    const currentPage = pagination.current_page || 1;
    const totalPages = pagination.total_pages || Math.ceil(count / 20);
    const hasNext = !!next;
    const hasPrevious = !!previous;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          pages.push(1, 2, 3, 4, "...", totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(
            1,
            "...",
            totalPages - 3,
            totalPages - 2,
            totalPages - 1,
            totalPages
          );
        } else {
          pages.push(
            1,
            "...",
            currentPage - 1,
            currentPage,
            currentPage + 1,
            "...",
            totalPages
          );
        }
      }

      return pages;
    };

    return (
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
        <div
          className={cn(
            "text-sm text-gray-600",
            isRTL ? "font-iransans" : "font-poppins"
          )}
        >
          {isRTL
            ? `نمایش ${Math.min(count, currentPage * 20)} از ${count} گزارش`
            : `Showing ${Math.min(
                count,
                currentPage * 20
              )} of ${count} reports`}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious}
            className={cn(
              "flex items-center gap-1",
              isRTL ? "font-iransans" : "font-poppins"
            )}
          >
            <ChevronLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
            {isRTL ? "قبلی" : "Previous"}
          </Button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <Button
                key={index}
                variant={page === currentPage ? "default" : "ghost"}
                size="sm"
                onClick={() => typeof page === "number" && onPageChange(page)}
                disabled={page === "..."}
                className={cn(
                  "min-w-[40px]",
                  page === currentPage &&
                    "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white",
                  isRTL ? "font-iransans" : "font-poppins"
                )}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
            className={cn(
              "flex items-center gap-1",
              isRTL ? "font-iransans" : "font-poppins"
            )}
          >
            {isRTL ? "بعدی" : "Next"}
            <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3
          className={cn(
            "text-lg font-semibold text-gray-900 mb-2",
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
    );
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "text-sm text-gray-600",
            isRTL ? "font-iransans" : "font-poppins"
          )}
        >
          {pagination?.count
            ? isRTL
              ? `${pagination.count} گزارش یافت شد`
              : `${pagination.count} reports found`
            : isRTL
            ? `${reports.length} گزارش`
            : `${reports.length} reports`}
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("compact")}
            className={cn(
              "p-2 rounded-md transition-all duration-200",
              viewMode === "compact"
                ? "bg-white text-[#FF4135] shadow-sm"
                : "text-gray-600 hover:text-[#FF4135]"
            )}
            title={isRTL ? "نمای فشرده" : "Compact view"}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-md transition-all duration-200",
              viewMode === "list"
                ? "bg-white text-[#FF4135] shadow-sm"
                : "text-gray-600 hover:text-[#FF4135]"
            )}
            title={isRTL ? "نمای فهرستی" : "List view"}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div
        className={cn(
          "space-y-3",
          viewMode === "compact" &&
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0"
        )}
      >
        {reports.map((report) => (
          <Link
            key={report.id}
            href={`/transparency/reports/${report.id}`}
            className={cn(
              "group block bg-white rounded-lg border border-gray-200 hover:border-[#FF4135] hover:shadow-md transition-all duration-200",
              viewMode === "compact" ? "p-4" : "p-4"
            )}
          >
            <div
              className={cn(
                "flex items-center gap-4",
                viewMode === "compact" && "flex-col items-start gap-3"
              )}
            >
              {/* Token Icon */}
              <div
                className={cn(
                  "flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm",
                  viewMode === "compact" && "self-start"
                )}
              >
                {report.token_image ? (
                  <img
                    src={report.token_image}
                    alt={report.token_symbol}
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  report.token_symbol || "T"
                )}
              </div>

              {/* Content */}
              <div
                className={cn(
                  "flex-1 min-w-0",
                  viewMode === "compact" && "w-full"
                )}
              >
                <div
                  className={cn(
                    "flex items-start justify-between gap-2 mb-1",
                    viewMode === "compact" && "flex-col items-start gap-1"
                  )}
                >
                  <h3
                    className={cn(
                      "font-semibold text-gray-900 group-hover:text-[#FF4135] transition-colors line-clamp-1",
                      isRTL ? "font-iransans" : "font-poppins",
                      viewMode === "compact" && "line-clamp-2 text-sm"
                    )}
                  >
                    {report.title}
                  </h3>

                  {viewMode === "list" && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                      <Calendar className="h-3 w-3" />
                      <span
                        className={isRTL ? "font-iransans" : "font-poppins"}
                      >
                        {formatPersianDate(report.created_date)}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    "flex items-center gap-4 text-sm text-gray-600",
                    viewMode === "compact" && "flex-col items-start gap-2"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3 w-3 text-gray-400" />
                    <span
                      className={cn(
                        "truncate",
                        isRTL ? "font-iransans" : "font-poppins"
                      )}
                    >
                      {report.token_name}
                    </span>
                  </div>

                  {report.attachments_count > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <FileText className="h-3 w-3 text-gray-400" />
                      <span
                        className={isRTL ? "font-iransans" : "font-poppins"}
                      >
                        {report.attachments_count} {isRTL ? "فایل" : "files"}
                      </span>
                    </div>
                  )}

                  {viewMode === "compact" && (
                    <div className="text-xs text-gray-500">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      <span
                        className={isRTL ? "font-iransans" : "font-poppins"}
                      >
                        {formatPersianDate(report.created_date)}
                      </span>
                    </div>
                  )}
                </div>

                {viewMode === "list" && report.description && (
                  <p
                    className={cn(
                      "text-sm text-gray-600 mt-2 line-clamp-1",
                      isRTL ? "font-iransans" : "font-poppins"
                    )}
                  >
                    {truncateText(report.description, 80)}
                  </p>
                )}
              </div>

              {/* Action Indicator */}
              <div
                className={cn(
                  "flex-shrink-0 text-gray-400 group-hover:text-[#FF4135] transition-colors",
                  viewMode === "compact" && "self-end"
                )}
              >
                <Eye className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <Pagination />
    </div>
  );
}
