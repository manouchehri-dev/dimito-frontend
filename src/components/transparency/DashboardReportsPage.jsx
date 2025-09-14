"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Eye,
  Globe,
  Lock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Search,
  Filter,
  Plus,
  LogOut,
  User,
} from "lucide-react";
import { useUserReports } from "@/lib/transparency/transparencyQueries";
import { useTogglePublishReport } from "@/lib/transparency/transparencyQueries";
import { useLogout } from "@/lib/auth/authQueries";
import { useAuthStore } from "@/lib/auth/authStore";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

export default function DashboardReportsPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, published, draft
  const pageSize = 20;

  const reportsParams = useMemo(
    () => ({
      page: currentPage,
      page_size: pageSize,
      ordering: "-created_date",
      search: searchQuery || undefined,
      is_published:
        statusFilter === "all" ? undefined : statusFilter === "published",
    }),
    [currentPage, pageSize, searchQuery, statusFilter]
  );

  const { data: reportsResponse, isLoading: loadingReports } =
    useUserReports(reportsParams);

  const togglePublishMutation = useTogglePublishReport();
  const logoutMutation = useLogout();
  const user = useAuthStore((s) => s.user);

  // Extract reports array from paginated response
  const reports = reportsResponse?.results || [];
  const totalReports = reportsResponse?.count || 0;
  const hasNextPage = !!reportsResponse?.next;
  const hasPreviousPage = !!reportsResponse?.previous;
  const totalPages = Math.ceil(totalReports / pageSize);

  const handleTogglePublish = (report) => {
    const newStatus = !report.is_published;
    const confirmMessage = newStatus
      ? t("confirmPublish")
      : t("confirmUnpublish");

    if (window.confirm(confirmMessage)) {
      togglePublishMutation.mutate({
        reportId: report.id,
        isPublished: newStatus,
      });
    }
  };

  const handleViewReport = (reportId) => {
    router.push(`/${locale}/transparency/reports/${reportId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleBackToDashboard = () => {
    router.push(`/${locale}/transparency/dashboard`);
  };

  const handleCreateReport = () => {
    router.push(`/${locale}/transparency/dashboard?create=true`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleLogout = () => {
    if (window.confirm(t("logoutConfirm"))) {
      logoutMutation.mutate(undefined, {
        onSuccess: () => {
          router.push(`/${locale}/transparency`);
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] relative overflow-hidden pt-[100px] lg:pt-[140px]">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#FF5D1B]/10 to-[#FF363E]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#FF363E]/10 to-[#FF5D1B]/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleBackToDashboard}
                  variant="outline"
                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("backToDashboard")}
                </Button>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] font-iransans">
                    {t("allReports")}
                  </h1>
                  <p className="text-gray-600 font-iransans mt-1">
                    {t("manageAllReports")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* User Info */}
                {user && (
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                    <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-[#2D2D2D] font-iransans">
                        {user.username || user.email}
                      </p>
                      <p className="text-gray-500 font-iransans text-xs">
                        {t("reporter")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Logout Button */}
                <Button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                  )}
                  {logoutMutation.isPending ? t("loggingOut") : t("logout")}
                </Button>

                <Button
                  onClick={handleCreateReport}
                  className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white font-iransans rounded-xl hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t("createReport")}
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("searchReports")}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF5D1B] focus:border-transparent font-iransans"
                  />
                </div>
              </form>

              <div className="flex gap-2">
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF5D1B] focus:border-transparent font-iransans"
                >
                  <option value="all">{t("allStatus")}</option>
                  <option value="published">{t("published")}</option>
                  <option value="draft">{t("drafts")}</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
            {loadingReports ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF5D1B]" />
                <span className="ml-3 text-gray-600 font-iransans">
                  {t("loadingReports")}
                </span>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 font-iransans mb-2">
                  {t("noReportsFound")}
                </h3>
                <p className="text-gray-500 font-iransans mb-6">
                  {searchQuery ? t("noSearchResults") : t("createFirstReport")}
                </p>
                <Button
                  onClick={handleCreateReport}
                  className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white font-iransans"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t("createReport")}
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                            report.is_published
                              ? "bg-green-100"
                              : "bg-yellow-100"
                          }`}
                        >
                          <FileText
                            className={`h-6 w-6 ${
                              report.is_published
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#2D2D2D] font-iransans text-lg">
                            {report.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600 font-iransans">
                              {report.token_symbol}
                            </span>
                            <span className="text-sm text-gray-600 font-iransans">
                              {report.is_published
                                ? t("published")
                                : t("draft")}
                            </span>
                            <span className="text-sm text-gray-600 font-iransans">
                              {report.attachments?.length || 0} {t("files")}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-iransans mt-2">
                            {new Date(report.created_date).toLocaleDateString(
                              locale === "fa" ? "fa-IR" : "en-US",
                              {
                                timeZone: "Asia/Tehran",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleViewReport(report.id)}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t("viewDetails")}
                        </Button>

                        <Button
                          onClick={() => handleTogglePublish(report)}
                          disabled={togglePublishMutation.isPending}
                          size="sm"
                          className={`transition-all duration-200 ${
                            report.is_published
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                        >
                          {togglePublishMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : report.is_published ? (
                            <Lock className="w-4 h-4 mr-1" />
                          ) : (
                            <Globe className="w-4 h-4 mr-1" />
                          )}
                          {togglePublishMutation.isPending
                            ? report.is_published
                              ? t("unpublishing")
                              : t("publishing")
                            : report.is_published
                            ? t("unpublish")
                            : t("publish")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600 font-iransans">
                      {t("showingResults", {
                        start: (currentPage - 1) * pageSize + 1,
                        end: Math.min(currentPage * pageSize, totalReports),
                        total: totalReports,
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!hasPreviousPage}
                        variant="outline"
                        size="sm"
                        className="text-gray-600 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        {t("previous")}
                      </Button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                variant={
                                  currentPage === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className={`w-8 h-8 p-0 ${
                                  currentPage === pageNum
                                    ? "bg-[#FF5D1B] text-white border-[#FF5D1B]"
                                    : "text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                      </div>

                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasNextPage}
                        variant="outline"
                        size="sm"
                        className="text-gray-600 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t("next")}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
