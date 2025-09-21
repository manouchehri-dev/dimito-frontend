"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Plus,
  FileText,
  BarChart3,
  Download,
  Settings,
  Eye,
  Globe,
  Lock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import CreateReportForm from "./CreateReportForm";
import { useUserReports } from "@/lib/transparency/transparencyQueries";
import { useTogglePublishReport } from "@/lib/transparency/transparencyQueries";
import { useLogout } from "@/lib/auth/authQueries";
import { useAuthUser } from "@/lib/auth/authStore";

export default function TransparencyDashboard() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Show 10 reports per page in dashboard

  // Memoize query params to avoid creating a new object each render
  const reportsQueryParams = useMemo(
    () => ({
      page: currentPage,
      page_size: pageSize,
      ordering: "-created_date", // Show newest first
    }),
    [currentPage, pageSize]
  );

  const { data: reportsResponse, isLoading: loadingReports } =
    useUserReports(reportsQueryParams);
  const togglePublishMutation = useTogglePublishReport();
  const logoutMutation = useLogout();
  const user = useAuthUser();

  // Extract reports array from paginated response
  const reports = reportsResponse?.results || [];
  const totalReports = reportsResponse?.count || 0;
  const hasNextPage = !!reportsResponse?.next;
  const hasPreviousPage = !!reportsResponse?.previous;
  const totalPages = Math.ceil(totalReports / pageSize);

  const handleCreateSuccess = (report) => {
    setShowCreateForm(false);
    // Could show a success toast here
    console.log("Report created successfully:", report);
  };

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

  const handleViewAllReports = () => {
    router.push(`/${locale}/transparency/dashboard/reports`);
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

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <CreateReportForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </div>
    );
  }

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
                <div className="h-12 w-12 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-xl flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] font-iransans">
                    {t("title")}
                  </h1>
                  <p className="text-gray-600 font-iransans mt-1">
                    {t("subtitle")}
                  </p>
                </div>
              </div>

              {/* Header Actions */}
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

                {/* Create Report Button */}
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white font-iransans rounded-xl hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t("createReport")}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2D2D2D] font-iransans">
                    {loadingReports ? "..." : totalReports}
                  </p>
                  <p className="text-sm text-gray-600 font-iransans">
                    {t("totalReports")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2D2D2D] font-iransans">
                    {loadingReports
                      ? "..."
                      : reports.filter((r) => r.is_published)?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600 font-iransans">
                    {t("published")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2D2D2D] font-iransans">
                    {loadingReports
                      ? "..."
                      : reports.filter((r) => !r.is_published)?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600 font-iransans">
                    {t("drafts")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2D2D2D] font-iransans">
                    {loadingReports
                      ? "..."
                      : reports.reduce(
                        (acc, r) => acc + (r.attachments?.length || 0),
                        0
                      ) || 0}
                  </p>
                  <p className="text-sm text-gray-600 font-iransans">
                    {t("attachments")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer"
              onClick={() => setShowCreateForm(true)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#2D2D2D] font-iransans">
                  {t("createReport")}
                </h3>
              </div>
              <p className="text-gray-600 font-iransans text-sm">
                {t("createNewReports")}
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#2D2D2D] font-iransans">
                  {t("analytics")}
                </h3>
              </div>
              <p className="text-gray-600 font-iransans text-sm">
                {t("accessAnalytics")}
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#2D2D2D] font-iransans">
                  {t("documents")}
                </h3>
              </div>
              <p className="text-gray-600 font-iransans text-sm">
                {t("downloadDocuments")}
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#2D2D2D] font-iransans">
                  {t("settings.title")}
                </h3>
              </div>
              <p className="text-gray-600 font-iransans text-sm">
                {t("manageSettings")}
              </p>
            </div>
          </div>

          {/* Recent Reports */}
          {reports && reports.length > 0 && (
            <div className="mt-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#2D2D2D] font-iransans">
                    {t("recentReports")}
                  </h2>
                  {totalReports > pageSize && (
                    <Button
                      onClick={handleViewAllReports}
                      variant="outline"
                      className="text-[#FF5D1B] border-[#FF5D1B] hover:bg-[#FF5D1B] hover:text-white transition-all duration-200"
                    >
                      {t("viewAllReports")}
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center ${report.is_published
                              ? "bg-green-100"
                              : "bg-yellow-100"
                            }`}
                        >
                          <FileText
                            className={`h-5 w-5 ${report.is_published
                                ? "text-green-600"
                                : "text-yellow-600"
                              }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-[#2D2D2D] font-iransans">
                            {report.title}
                          </h3>
                          <p className="text-sm text-gray-600 font-iransans">
                            {report.is_published ? t("published") : t("draft")}{" "}
                            • {report.attachments?.length || 0} {t("files")}
                          </p>
                          <p className="text-xs text-gray-500 font-iransans mt-1">
                            {new Date(report.created_date).toLocaleDateString(
                              locale === "fa" ? "fa-IR" : "en-US",
                              {
                                timeZone: "Asia/Tehran",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* View Details Button */}
                        <Button
                          onClick={() => handleViewReport(report.id)}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t("viewDetails")}
                        </Button>

                        {/* Publish/Unpublish Button */}
                        <Button
                          onClick={() => handleTogglePublish(report)}
                          disabled={togglePublishMutation.isPending}
                          size="sm"
                          className={`transition-all duration-200 ${report.is_published
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

                {/* Pagination Controls */}
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
                        <ChevronRight className="w-4 h-4 mr-1" />
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
                                className={`w-8 h-8 p-0 ${currentPage === pageNum
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
                        <ChevronLeft className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
