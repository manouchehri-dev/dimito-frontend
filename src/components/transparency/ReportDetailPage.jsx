"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Building2,
  Eye,
  Clock,
  CheckCircle,
  Globe,
  Shield,
  Lock,
  AlertCircle,
  Download,
  X,
  Mountain,
  BadgeDollarSign,
  HandCoins,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPersianDate } from "@/lib/date";
import { useReport } from "@/lib/transparency/transparencyQueries";
import { Link } from "@/i18n/navigation";

/**
 * Report Detail Page Component
 * Professional mining report detail view with corporate design
 */
export default function ReportDetailPage({ reportId }) {
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === "fa";
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showMinesModal, setShowMinesModal] = useState(false);

  const { data: report, isLoading, error } = useReport(reportId);


  const handleOpenAttachmentModal = () => {
    setShowAttachmentModal(true);
  };

  const handleCloseAttachmentModal = () => {
    setShowAttachmentModal(false);
  };

  const handleOpenMinesModal = () => {
    setShowMinesModal(true);
  };

  const handleCloseMinesModal = () => {
    setShowMinesModal(false);
  };

  const handleMinesModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseMinesModal();
    }
  };

  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowAttachmentModal(false);
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      // Create a temporary link to download the file
      const link = document.createElement("a");
      link.href = attachment.file_url;
      link.download = attachment.filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return isRTL ? "0 بایت" : "0 Bytes";
    const k = 1024;
    const sizes = isRTL
      ? ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"]
      : ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (contentType) => {
    if (contentType?.includes("pdf")) return "📄";
    if (contentType?.includes("image")) return "🖼️";
    if (contentType?.includes("excel") || contentType?.includes("spreadsheet"))
      return "📊";
    if (contentType?.includes("word") || contentType?.includes("document"))
      return "📝";
    return "📎";
  };

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Enhanced status badge component
  const getStatusConfig = (isPublished) => {
    if (isPublished) {
      return {
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        icon: CheckCircle,
        label: t("published"),
        description: t("visibleToPublic"),
      };
    } else {
      return {
        bgColor: "bg-amber-100",
        textColor: "text-amber-700",
        icon: Clock,
        label: t("draft"),
        description: t("awaitingPublication"),
      };
    }
  };

  // Enhanced visibility badge component
  const getVisibilityConfig = (isPublished) => {
    if (isPublished) {
      return {
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        icon: Globe,
        label: t("publicAccess"),
        description: t("accessibleToEveryone"),
      };
    } else {
      return {
        bgColor: "bg-gray-100",
        textColor: "text-gray-600",
        icon: Lock,
        label: t("restrictedAccess"),
        description: t("onlyVisibleToAuthorizedUsers"),
      };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-[100px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="bg-white rounded-2xl p-8 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-[140px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1
              className={cn(
                "text-2xl font-bold text-gray-900 mb-4",
                isRTL ? "font-iransans" : "font-poppins"
              )}
            >
              {t("reportNotFound") || "Report not found"}
            </h1>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className={isRTL ? "font-iransans" : "font-poppins"}
            >
              <ArrowLeft
                className={cn("h-4 w-4", isRTL ? "ml-2 rotate-180" : "mr-2")}
              />
              {tCommon("back")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(report.is_published);
  const visibilityConfig = getVisibilityConfig(report.is_published);
  const StatusIcon = statusConfig.icon;
  const VisibilityIcon = visibilityConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-[100px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className={cn(
              "flex items-center gap-2 hover:bg-gray-50",
              isRTL ? "font-iransans" : "font-poppins"
            )}
          >
            <ArrowLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
            {tCommon("back")}
          </Button>
        </div>

        {/* Header Cards Row */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6 sm:mb-8">
          {/* Report Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 flex-1">
            {/* Status Badges and Token Symbol */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                {/* Token Symbol - Prominent */}
                <Link href={`/transparency/?token=${report.token}`} target="_blank" className="flex items-start gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 bg-[#FF5D1B]/15 text-[#FF5D1B]">
                  <HandCoins className="h-4 w-4" />
                  <span className={cn("font-semibold", isRTL ? "font-iransans" : "font-poppins")}>
                    {report.token_symbol}
                  </span>

                </Link>

                {/* Draft Warning - Only show for drafts */}
                {!report.is_published && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-medium border border-orange-200">
                    <AlertCircle className="h-3 w-3" />
                    <span className={isRTL ? "font-iransans" : "font-poppins"}>
                      {t("previewMode") || "Preview Mode"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-row gap-3">
                {/* Status Badge */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${statusConfig.bgColor} ${statusConfig.textColor}`}
                >
                  <StatusIcon className="h-4 w-4" />
                  <span className={isRTL ? "font-iransans" : "font-poppins"}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Visibility Badge */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${visibilityConfig.bgColor} ${visibilityConfig.textColor}`}
                >
                  <VisibilityIcon className="h-4 w-4" />
                  <span className={isRTL ? "font-iransans" : "font-poppins"}>
                    {visibilityConfig.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Meta Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {report.token_detail?.token_address && (
                <div className="flex items-center gap-2">
                  <span className={cn("text-gray-500", isRTL ? "font-iransans" : "font-poppins")}>
                    {t("address")}:
                  </span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    {shortenAddress(report.token_detail.token_address)}
                  </code>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className={cn("text-gray-500", isRTL ? "font-iransans" : "font-poppins")}>
                  {t("created") || "Created"}:
                </span>
                <span className={cn("text-gray-600", isRTL ? "font-iransans" : "font-poppins")}>
                  {formatPersianDate(report.created_date)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={cn("text-gray-500", isRTL ? "font-iransans" : "font-poppins")}>
                  {t("updated") || "Updated"}:
                </span>
                <span className={cn("text-gray-600", isRTL ? "font-iransans" : "font-poppins")}>
                  {formatPersianDate(report.updated_date)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={cn("text-gray-500", isRTL ? "font-iransans" : "font-poppins")}>
                  {report.selected_mines.length > 1 ? t("mines") || "Mines" : t("mine") || "Mine"}:
                </span>
                {(() => {
                  const selectedMines = report.selected_mines || [];

                  if (selectedMines.length > 1) {
                    return (
                      <button
                        onClick={handleOpenMinesModal}
                        className={cn(
                          "text-[#FF5D1B] hover:text-[#FF363E] underline transition-colors cursor-pointer",
                          isRTL ? "font-iransans" : "font-poppins"
                        )}
                      >
                        {selectedMines.length} {t("mines") || "mines"}
                      </button>
                    );
                  } else if (selectedMines.length === 1) {
                    const mine = selectedMines[0];
                    return (
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/transparency/?mine_name=${encodeURIComponent(mine.name)}`} 
                          target="_blank" 
                          className={cn("text-gray-700 font-medium hover:text-[#FF5D1B] transition-colors underline", isRTL ? "font-iransans" : "font-poppins")}
                        >
                          {mine.name}
                        </Link>
                        {mine.location && (
                          <>
                            <span className="text-gray-400">•</span>
                            <Link 
                              href={`/transparency/?mine_location=${encodeURIComponent(mine.location)}`} 
                              target="_blank" 
                              className={cn("text-gray-500 text-sm hover:text-[#FF5D1B] transition-colors underline", isRTL ? "font-iransans" : "font-poppins")}
                            >
                              {mine.location}
                            </Link>
                          </>
                        )}
                        <span className={cn("text-[#FF5D1B] font-semibold ml-2", isRTL ? "font-iransans" : "font-poppins")}>
                          ({mine.allocation_percentage ? mine.allocation_percentage : 0}%)
                        </span>
                      </div>
                    );
                  } else {
                    return (
                      <span className={cn("text-gray-600", isRTL ? "font-iransans" : "font-poppins")}>
                        {t("noMinesAssigned") || "No mines assigned"}
                      </span>
                    );
                  }
                })()}
              </div>
            </div>
          </div>

          {/* Attachment Card */}
          {report.attachments && report.attachments.length > 0 && (
            <div className="xl:w-1/4 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 flex-shrink-0">
              <h3
                className={cn(
                  "text-lg font-bold text-gray-900 mb-4",
                  isRTL ? "font-iransans" : "font-poppins"
                )}
              >
                {t("attachments")} ({report.attachments.length})
              </h3>
              <Button
                onClick={handleOpenAttachmentModal}
                className="w-full bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                <Eye className="h-4 w-4 mr-2" />
                {t("viewAttachments") || "View Attachments"}
              </Button>
            </div>
          )}
        </div>

        {/* Main Content - Full Width */}
        <div className="space-y-6 sm:space-y-8">
          {/* Description */}
          {report.description && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              {/* Title */}
              <h1
                className={cn(
                  "text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight",
                  isRTL ? "font-iransans" : "font-poppins"
                )}
              >
                {report.title}
              </h1>

              <h2
                className={cn(
                  "text-xl font-bold text-gray-900 mb-4",
                  isRTL ? "font-iransans" : "font-poppins"
                )}
              >
                {t("description")}
              </h2>
              <div
                className={cn(
                  "prose max-w-none text-gray-700 leading-relaxed",
                  isRTL ? "font-iransans" : "font-poppins"
                )}
              >
                {report.description.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mines Modal */}
        {showMinesModal && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleMinesModalBackdropClick}
          >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 max-w-md w-full max-h-[60vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2
                  className={cn(
                    "text-xl font-bold text-gray-900",
                    isRTL ? "font-iransans" : "font-poppins"
                  )}
                >
                  {t("mines") || "Mines"}
                </h2>
                <button
                  onClick={handleCloseMinesModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[40vh] overflow-y-auto">
                {(() => {
                  const selectedMines = report.selected_mines || [];

                  return (
                    <div className="space-y-3">
                      {selectedMines.map((mine, index) => (
                        <div
                          key={mine.id || index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Mountain className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            <div>
                              <Link
                                href={`/transparency/?mine_name=${encodeURIComponent(mine.name)}`}
                                target="_blank"
                                className={cn(
                                  "text-gray-700 font-medium block hover:text-[#FF5D1B] transition-colors underline",
                                  isRTL ? "font-iransans" : "font-poppins"
                                )}
                              >
                                {mine.name}
                              </Link>
                              {mine.location && (
                                <Link
                                  href={`/transparency/?mine_location=${encodeURIComponent(mine.location)}`}
                                  target="_blank"
                                  className={cn(
                                    "text-gray-500 text-sm hover:text-[#FF5D1B] transition-colors underline",
                                    isRTL ? "font-iransans" : "font-poppins"
                                  )}
                                >
                                  {mine.location}
                                </Link>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={cn(
                                "text-[#FF5D1B] font-semibold text-lg",
                                isRTL ? "font-iransans" : "font-poppins"
                              )}
                            >

                              {mine.allocation_percentage ? mine.allocation_percentage : 0}%
                            </span>
                            <div
                              className={cn(
                                "text-gray-500 text-xs",
                                isRTL ? "font-iransans" : "font-poppins"
                              )}
                            >
                              {t("allocation") || "Allocation"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end p-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleCloseMinesModal}
                  className={isRTL ? "font-iransans" : "font-poppins"}
                >
                  {tCommon("close") || "Close"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Attachment Modal */}
        {showAttachmentModal && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleModalBackdropClick}
          >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2
                  className={cn(
                    "text-xl font-bold text-gray-900",
                    isRTL ? "font-iransans" : "font-poppins"
                  )}
                >
                  {t("attachments")} ({report.attachments?.length || 0})
                </h2>
                <button
                  onClick={handleCloseAttachmentModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {report.attachments && report.attachments.length > 0 ? (
                  <div className="space-y-3">
                    {report.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl flex-shrink-0">
                            {getFileIcon(attachment.content_type)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                "font-medium text-gray-900 truncate",
                                isRTL ? "font-iransans" : "font-poppins"
                              )}
                            >
                              {attachment.filename}
                            </p>
                            <p
                              className={cn(
                                "text-sm text-gray-500",
                                isRTL ? "font-iransans" : "font-poppins"
                              )}
                            >
                              {formatFileSize(attachment.file_size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleDownloadAttachment(attachment)}
                          className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white hover:scale-105 transition-all duration-200"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p
                      className={cn(
                        "text-gray-500",
                        isRTL ? "font-iransans" : "font-poppins"
                      )}
                    >
                      {t("noAttachments") || "No attachments available"}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end p-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleCloseAttachmentModal}
                  className={isRTL ? "font-iransans" : "font-poppins"}
                >
                  {tCommon("close") || "Close"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
