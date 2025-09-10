"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus, FileText, BarChart3, Download, Settings } from "lucide-react";
import CreateReportForm from "./CreateReportForm";
import { useUserReports } from "@/lib/transparency/transparencyQueries";

export default function TransparencyDashboard() {
  const t = useTranslations("dashboard");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: reportsResponse, isLoading: loadingReports } = useUserReports();

  // Extract reports array from paginated response
  const reports = reportsResponse?.results || [];
  const totalReports = reportsResponse?.count || 0;

  const handleCreateSuccess = (report) => {
    setShowCreateForm(false);
    // Could show a success toast here
    console.log("Report created successfully:", report);
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
    <div className="min-h-screen bg-[#F5F5F5] relative overflow-hidden pt-[140px] lg:pt-[180px]">
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
                  {t("settings")}
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
                <h2 className="text-2xl font-bold text-[#2D2D2D] font-iransans mb-6">
                  {t("recentReports")}
                </h2>
                <div className="space-y-4">
                  {reports.slice(0, 5).map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            report.is_published
                              ? "bg-green-100"
                              : "bg-yellow-100"
                          }`}
                        >
                          <FileText
                            className={`h-5 w-5 ${
                              report.is_published
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-[#2D2D2D] font-iransans">
                            {report.title}
                          </h3>
                          <p className="text-sm text-gray-600 font-iransans">
                            {report.is_published ? t("published") : t("draft")}{" "}
                            • {report.attachments?.length || 0} {t("files")}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 font-iransans">
                        {new Date(report.created_date).toLocaleDateString(
                          "fa-IR",
                          {
                            timeZone: "Asia/Tehran",
                          }
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
