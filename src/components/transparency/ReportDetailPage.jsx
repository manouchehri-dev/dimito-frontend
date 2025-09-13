"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  User,
  Building2,
  Eye,
  Share2,
  ExternalLink,
  Clock,
  CheckCircle,
  Globe,
  Shield,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Facebook,
  Lock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPersianDate } from "@/lib/date";
import { useReport } from "@/lib/transparency/transparencyQueries";

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
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const shareMenuRef = useRef(null);

  const { data: report, isLoading, error } = useReport(reportId);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target)
      ) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showShareMenu]);

  const handleDownload = async (attachment) => {
    setDownloadingFile(attachment.id);
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
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareMenu(false);
      }, 2000);
    }
  };

  const handleSocialShare = (platform) => {
    const currentUrl = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(
      `${report.title} - ${report.token_name} Transparency Report`
    );
    const description = encodeURIComponent(
      report.description ||
      `View transparency report for ${report.token_name} (${report.token_symbol})`
    );

    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${currentUrl}&text=${title}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
    setShowShareMenu(false);
  };

  const handleViewFullscreen = () => {
    // Open current page in new tab for full-screen viewing
    window.open(window.location.href, "_blank");
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

        {/* Report Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              {/* Enhanced Status Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
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

              {/* Title */}
              <h1
                className={cn(
                  "text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight",
                  isRTL ? "font-iransans" : "font-poppins"
                )}
              >
                {report.title}
              </h1>

              {/* Meta Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <div>
                    <p
                      className={cn(
                        "text-gray-500",
                        isRTL ? "font-iransans" : "font-poppins"
                      )}
                    >
                      {t("token")}
                    </p>
                    <p
                      className={cn(
                        "font-medium text-gray-900",
                        isRTL ? "font-iransans" : "font-poppins"
                      )}
                    >
                      {report.token_name} ({report.token_symbol})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p
                      className={cn(
                        "text-gray-500",
                        isRTL ? "font-iransans" : "font-poppins"
                      )}
                    >
                      {t("author")}
                    </p>
                    <p
                      className={cn(
                        "font-medium text-gray-900",
                        isRTL ? "font-iransans" : "font-poppins"
                      )}
                    >
                      {report.author_full_name || report.author_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p
                      className={cn(
                        "text-gray-500",
                        isRTL ? "font-iransans" : "font-poppins"
                      )}
                    >
                      {report.is_published ? t("published") : t("created")}
                    </p>
                    <p
                      className={cn(
                        "font-medium text-gray-900",
                        isRTL ? "font-iransans" : "font-poppins"
                      )}
                    >
                      {formatPersianDate(report.created_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div>
                    <p
                      className={cn(
                        "text-gray-500",
                        isRTL ? "font-iransans" : "font-poppins"
                      )}
                    >
                      {t("attachments")}
                    </p>
                    <p
                      className={cn(
                        "font-medium text-gray-900",
                        isRTL ? "font-iransans" : "font-poppins"
                      )}
                    >
                      {report.attachments_count} {t("files")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 relative">
              <div className="relative" ref={shareMenuRef}>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className={cn(
                    "flex items-center gap-2 w-full",
                    isRTL ? "font-iransans" : "font-poppins"
                  )}
                  disabled={!report.is_published} // Disable share for drafts
                >
                  <Share2 className="h-4 w-4" />
                  {tCommon("share")}
                </Button>

                {/* Share Menu */}
                {showShareMenu && (
                  <div
                    className={cn(
                      "absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[200px] z-50",
                      isRTL ? "left-0" : "right-0"
                    )}
                  >
                    <div className="space-y-1">
                      <button
                        onClick={handleCopyLink}
                        className={cn(
                          "flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors",
                          isRTL ? "font-iransans" : "font-poppins"
                        )}
                      >
                        {copySuccess ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">
                              {t("linkCopied") || "Link copied!"}
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>{t("copyLink") || "Copy link"}</span>
                          </>
                        )}
                      </button>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={() => handleSocialShare("twitter")}
                        className={cn(
                          "flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors",
                          isRTL ? "font-iransans" : "font-poppins"
                        )}
                      >
                        <Twitter className="h-4 w-4 text-blue-400" />
                        <span>{t("shareOnTwitter") || "Share on Twitter"}</span>
                      </button>

                      <button
                        onClick={() => handleSocialShare("linkedin")}
                        className={cn(
                          "flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors",
                          isRTL ? "font-iransans" : "font-poppins"
                        )}
                      >
                        <Linkedin className="h-4 w-4 text-blue-600" />
                        <span>
                          {t("shareOnLinkedIn") || "Share on LinkedIn"}
                        </span>
                      </button>

                      <button
                        onClick={() => handleSocialShare("facebook")}
                        className={cn(
                          "flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors",
                          isRTL ? "font-iransans" : "font-poppins"
                        )}
                      >
                        <Facebook className="h-4 w-4 text-blue-700" />
                        <span>
                          {t("shareOnFacebook") || "Share on Facebook"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                onClick={handleViewFullscreen}
                className={cn(
                  "flex items-center gap-2",
                  isRTL ? "font-iransans" : "font-poppins"
                )}
              >
                <ExternalLink className="h-4 w-4" />
                {t("openInNewTab") || "Open in new tab"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Token Information */}
            {report.token_detail && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h2
                  className={cn(
                    "text-xl font-bold text-gray-900 mb-6",
                    isRTL ? "font-iransans" : "font-poppins"
                  )}
                >
                  {t("tokenInformation")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3
                      className={cn(
                        "font-medium text-gray-900 mb-2",
                        isRTL ? "font-iransans" : "font-poppins"
                      )}
                    >
                      {report.token_detail.token_name}
                    </h3>
                    <p
                      className={cn(
                        "text-sm text-gray-600 mb-4",
                        isRTL ? "font-iransans" : "font-poppins"
                      )}
                    >
                      {report.token_detail.token_description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span
                          className={cn(
                            "text-gray-500",
                            isRTL ? "font-iransans" : "font-poppins"
                          )}
                        >
                          {t("symbol")}:
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            isRTL ? "font-iransans" : "font-poppins"
                          )}
                        >
                          {report.token_detail.token_symbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span
                          className={cn(
                            "text-gray-500",
                            isRTL ? "font-iransans" : "font-poppins"
                          )}
                        >
                          {t("decimals")}:
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            isRTL ? "font-iransans" : "font-poppins"
                          )}
                        >
                          {report.token_detail.token_decimals}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4
                      className={cn(
                        "font-medium text-gray-900 mb-2",
                        isRTL ? "font-iransans" : "font-poppins"
                      )}
                    >
                      {t("contractAddress")}
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm break-all">
                      {report.token_detail.token_address}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {report.description && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attachments */}
            {report.attachments && report.attachments.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3
                  className={cn(
                    "text-lg font-bold text-gray-900 mb-4",
                    isRTL ? "font-iransans" : "font-poppins"
                  )}
                >
                  {t("attachments")} ({report.attachments.length})
                </h3>
                <div className="space-y-3">
                  {report.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                        onClick={() => handleDownload(attachment)}
                        disabled={downloadingFile === attachment.id}
                        className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white hover:scale-105 transition-all duration-200"
                      >
                        {downloadingFile === attachment.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3
                className={cn(
                  "text-lg font-bold text-gray-900 mb-4",
                  isRTL ? "font-iransans" : "font-poppins"
                )}
              >
                {t("reportInformation")}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span
                    className={cn(
                      "text-gray-500",
                      isRTL ? "font-iransans" : "font-poppins"
                    )}
                  >
                    {t("reportId")}:
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      isRTL ? "font-iransans" : "font-poppins"
                    )}
                  >
                    #{report.id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={cn(
                      "text-gray-500",
                      isRTL ? "font-iransans" : "font-poppins"
                    )}
                  >
                    {t("created")}:
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      isRTL ? "font-iransans" : "font-poppins"
                    )}
                  >
                    {formatPersianDate(report.created_date)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={cn(
                      "text-gray-500",
                      isRTL ? "font-iransans" : "font-poppins"
                    )}
                  >
                    {t("lastUpdated")}:
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      isRTL ? "font-iransans" : "font-poppins"
                    )}
                  >
                    {formatPersianDate(report.updated_date)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={cn(
                      "text-gray-500",
                      isRTL ? "font-iransans" : "font-poppins"
                    )}
                  >
                    {t("status")}:
                  </span>
                  <span className="flex items-center gap-1">
                    <StatusIcon
                      className={`h-3 w-3 ${statusConfig.textColor.replace(
                        "text-",
                        "text-"
                      )}`}
                    />
                    <span
                      className={cn(
                        `font-medium ${statusConfig.textColor}`,
                        isRTL ? "font-iransans" : "font-poppins"
                      )}
                    >
                      {statusConfig.label}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Indicators - Only show for published reports */}
            {report.is_published && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <h3
                    className={cn(
                      "text-lg font-bold text-blue-900",
                      isRTL ? "font-iransans" : "font-poppins"
                    )}
                  >
                    {t("verifiedReport")}
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className={isRTL ? "font-iransans" : "font-poppins"}>
                      {t("officiallyVerified")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className={isRTL ? "font-iransans" : "font-poppins"}>
                      {t("blockchainBacked")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className={isRTL ? "font-iransans" : "font-poppins"}>
                      {t("publiclyAuditable")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Draft Notice - Only show for drafts */}
            {!report.is_published && (
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border border-orange-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-6 w-6 text-orange-600" />
                  <h3
                    className={cn(
                      "text-lg font-bold text-orange-900",
                      isRTL ? "font-iransans" : "font-poppins"
                    )}
                  >
                    {t("draftReport") || "Draft Report"}
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-orange-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span className={isRTL ? "font-iransans" : "font-poppins"}>
                      {t("awaitingPublication") || "Awaiting publication"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-orange-600" />
                    <span className={isRTL ? "font-iransans" : "font-poppins"}>
                      {t("restrictedAccess") || "Restricted access"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-orange-600" />
                    <span className={isRTL ? "font-iransans" : "font-poppins"}>
                      {t("previewMode") || "Preview mode"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
