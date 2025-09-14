"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Search,
  Filter,
  Calendar,
  FileText,
  Eye,
  Building2,
  Download,
  Clock,
  Shield,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReportsList from "./ReportsList";
import AdvancedFilters from "./AdvancedFilters";
import { usePublicReports } from "@/lib/transparency/transparencyQueries";

/**
 * Official Transparency Main Page Component
 * Professional corporate transparency system for public access
 */
export default function TransparencyMainPage() {
  const t = useTranslations("reports");
  const locale = useLocale();
  const isRTL = locale === "fa";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [queryParams, setQueryParams] = useState({
    ordering: "-created_date", // Newest first by default
    page_size: 20,
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Initialize filters from URL on component mount
  useEffect(() => {
    const urlParams = {};

    // Extract filter parameters from URL
    const filterFields = [
      "title",
      "date_from",
      "date_to",
      "token",
      "author",
      "search",
      "mine_name",
      "mine_location",
    ];
    filterFields.forEach((field) => {
      const value = searchParams.get(field);
      if (value) {
        urlParams[field] = value;
      }
    });

    // Extract pagination and ordering
    const page = searchParams.get("page");
    const ordering = searchParams.get("ordering");
    const pageSize = searchParams.get("page_size");

    setQueryParams((prev) => ({
      ...prev,
      ...urlParams,
      page: page ? parseInt(page) : 1,
      ordering: ordering || "-created_date",
      page_size: pageSize ? parseInt(pageSize) : 20,
    }));
  }, [searchParams]);

  // Fetch only published reports for public view
  const { data: reportsResponse, isLoading: loadingReports } =
    usePublicReports(queryParams);
  const reports = reportsResponse?.results || [];
  const totalReports = reportsResponse?.count || 0;

  const handleSearch = (query) => {
    const newParams = {
      ...queryParams,
      search: query || undefined, // Remove search param if empty
      page: 1, // Reset to first page
    };
    setQueryParams(newParams);
    updateURL(newParams);
  };

  /**
   * Handle filter changes from AdvancedFilters component
   */
  const handleFiltersChange = (filters) => {
    // Start with base params (ordering, page_size)
    const baseParams = {
      ordering: queryParams.ordering || "-created_date",
      page_size: queryParams.page_size || 20,
      page: 1, // Reset to first page when filters change
    };

    // Add only non-empty filter values
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        acc[key] = value;
      }
      return acc;
    }, {});

    const newParams = {
      ...baseParams,
      ...cleanFilters,
    };

    setQueryParams(newParams);
    updateURL(newParams);
  };

  /**
   * Update URL with current filter parameters
   */
  const updateURL = (params) => {
    const url = new URL(window.location);

    // Clear existing filter parameters
    const filterFields = [
      "title",
      "date_from",
      "date_to",
      "token",
      "author",
      "search",
      "page",
      "ordering",
      "page_size",
    ];
    filterFields.forEach((field) => {
      url.searchParams.delete(field);
    });

    // Add current parameters
    Object.entries(params).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        !["page_size"].includes(key)
      ) {
        // Don't include page_size in URL unless changed
        if (key === "page" && value === 1) {
          // Don't include page=1 in URL
          return;
        }
        if (key === "ordering" && value === "-created_date") {
          // Don't include default ordering in URL
          return;
        }
        url.searchParams.set(key, value.toString());
      }
    });

    // Update URL without page reload
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // Calculate statistics
  const uniqueCompanies = new Set(
    reports.map((r) => r.token_name || r.token?.name)
  ).size;
  const totalDocuments = reports.reduce(
    (acc, r) => acc + (r.attachments_count || r.attachments?.length || 0),
    0
  );

  const statisticsCards = [
    {
      title: t("totalReports"),
      value: loadingReports ? "..." : totalReports,
      icon: FileText,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: t("verifiedCompanies"),
      value: loadingReports ? "..." : uniqueCompanies,
      icon: Building2,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
    },
    {
      title: t("documentsAvailable"),
      value: loadingReports ? "..." : totalDocuments,
      icon: Download,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
    },
    {
      title: t("lastUpdated"),
      value: loadingReports ? "..." : t("today"),
      icon: Clock,
      color: "orange",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-[140px] lg:pt-[180px] mb-10">
      {/* Corporate Commitment Banner */}
      <div className="max-w-7xl mx-auto  bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl sm:rounded-2xl border border-blue-200 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h2
              className={cn(
                "text-lg sm:text-xl lg:text-2xl font-bold text-blue-900 mb-2",
                isRTL ? "font-iransans" : "font-poppins"
              )}
            >
              {t("publicTransparencyCommitment")}
            </h2>
            <p
              className={cn(
                "text-sm sm:text-base text-blue-800 leading-relaxed",
                isRTL ? "font-iransans" : "font-poppins"
              )}
            >
              {t("transparencyCommitmentDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statisticsCards.map((card, index) => (
          <div
            key={index}
            className={cn(
              "bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6",
              card.borderColor
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p
                  className={cn(
                    "text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2",
                    isRTL ? "font-iransans" : "font-poppins"
                  )}
                >
                  {card.title}
                </p>
                <p
                  className={cn(
                    "text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900",
                    isRTL ? "font-iransans" : "font-poppins"
                  )}
                >
                  {card.value}
                </p>
              </div>
              <div
                className={cn(
                  "h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center flex-shrink-0",
                  card.bgColor
                )}
              >
                <card.icon
                  className={cn("h-5 w-5 sm:h-6 sm:w-6", card.iconColor)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Reports Section */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400",
                    isRTL ? "right-3" : "left-3"
                  )}
                />
                <Input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={queryParams.search || ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={cn(
                    "h-12 border-2 border-gray-200 hover:border-[#FF4135] focus:border-[#FF4135] focus:ring-2 focus:ring-[#FF4135]/20 bg-white rounded-xl text-sm sm:text-base transition-all duration-200",
                    isRTL
                      ? "pr-10 sm:pr-12 font-iransans"
                      : "pl-10 sm:pl-12 font-poppins"
                  )}
                />
                {queryParams.search && (
                  <button
                    type="button"
                    onClick={() => handleSearch("")}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF4135] transition-colors duration-200",
                      isRTL ? "left-3" : "right-3"
                    )}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Advanced Filters Button */}
              <div className="flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={cn(
                    "w-full h-12 rounded-xl border-2 transition-all duration-200",
                    isRTL ? "font-iransans" : "font-poppins",
                    showAdvancedFilters && "border-[#FF4135] bg-[#FF4135]/5"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <span>{t("advancedFilters")}</span>
                    </div>
                    {showAdvancedFilters ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </Button>
              </div>
            </div>

            {/* Advanced Filters Panel - Positioned below search area */}
            {showAdvancedFilters && (
              <AdvancedFilters
                filters={queryParams}
                onFiltersChange={handleFiltersChange}
                onApplyFilters={handleFiltersChange}
                onClearFilters={() => handleFiltersChange({})}
              />
            )}
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          <ReportsList
            reports={reports}
            isLoading={loadingReports}
            pagination={{
              count: totalReports,
              next: reportsResponse?.next,
              previous: reportsResponse?.previous,
              current_page: queryParams.page || 1,
              total_pages: Math.ceil(
                totalReports / (queryParams.page_size || 20)
              ),
            }}
            onPageChange={(page) => {
              const newParams = { ...queryParams, page };
              setQueryParams(newParams);
              updateURL(newParams);
            }}
          />
        </div>
      </div>
    </div>
  );
}
