"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Upload, X, FileText, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useTokenOptions,
  useCreateReport,
  useUploadAttachments,
  useTogglePublishReport,
} from "@/lib/transparency/transparencyQueries";

/**
 * Create Report Form Component
 * Comprehensive form for creating transparency reports with file attachments
 */
export default function CreateReportForm({ onSuccess, onCancel }) {
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isRTL = locale === "fa";

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    token: "",
    description: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1); // 1: Form, 2: Files, 3: Review
  const [createdReport, setCreatedReport] = useState(null);

  // React Query hooks
  const { data: tokenOptions, isLoading: loadingTokens } = useTokenOptions();
  const createReportMutation = useCreateReport();
  const uploadAttachmentsMutation = useUploadAttachments();
  const togglePublishMutation = useTogglePublishReport();

  /**
   * Handle input changes
   */
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((event) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  }, []);

  /**
   * Remove selected file
   */
  const removeFile = useCallback((index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Validate form fields
   */
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = t("reportTitleRequired");
    }

    if (!formData.token) {
      errors.token = t("selectTokenRequired");
    }

    // Description is optional, so no validation needed

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission - Step 1
   */
  const handleCreateReport = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const report = await createReportMutation.mutateAsync(formData);
      setCreatedReport(report);
      setCurrentStep(2);
    } catch (error) {
      console.error("Failed to create report:", error);
    }
  };

  /**
   * Handle file upload - Step 2
   */
  const handleUploadFiles = async () => {
    if (!createdReport) return;

    try {
      if (selectedFiles.length > 0) {
        await uploadAttachmentsMutation.mutateAsync({
          reportId: createdReport.id,
          files: selectedFiles,
        });
      }
      setCurrentStep(3);
    } catch (error) {
      console.error("Failed to upload files:", error);
    }
  };

  /**
   * Handle publish report - Step 3
   */
  const handlePublishReport = async (shouldPublish = false) => {
    if (!createdReport) return;

    try {
      if (shouldPublish) {
        await togglePublishMutation.mutateAsync({
          reportId: createdReport.id,
          isPublished: true,
        });
      }
      onSuccess?.(createdReport);
    } catch (error) {
      console.error("Failed to publish report:", error);
    }
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return isRTL ? "0 بایت" : "0 Bytes";
    const k = 1024;
    const sizes = isRTL
      ? ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"]
      : ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  /**
   * Get step indicator
   */
  const StepIndicator = ({ step, currentStep, title }) => (
    <div className="flex items-center">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
          step < currentStep
            ? "bg-green-500 text-white"
            : step === currentStep
            ? "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white"
            : "bg-gray-200 text-gray-500"
        )}
      >
        {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
      </div>
      <span
        className={cn(
          "text-sm font-medium",
          isRTL ? "mr-2 font-iransans" : "ml-2 font-poppins",
          step <= currentStep ? "text-[#2D2D2D]" : "text-gray-500"
        )}
      >
        {title}
      </span>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pt-[100px] lg:pt-[140px]">
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-xl">
        <CardHeader>
          <CardTitle
            className={cn(
              "text-2xl font-bold text-[#2D2D2D]",
              isRTL ? "font-iransans" : "font-poppins"
            )}
          >
            {t("createReport")}
          </CardTitle>
          <CardDescription className={isRTL ? "font-iransans" : "font-poppins"}>
            {t("createReportSubtitle")}
          </CardDescription>

          {/* Step Indicator */}
          <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
            <StepIndicator
              step={1}
              currentStep={currentStep}
              title={t("reportDetails")}
            />
            <StepIndicator
              step={2}
              currentStep={currentStep}
              title={t("attachments")}
            />
            <StepIndicator
              step={3}
              currentStep={currentStep}
              title={t("reviewPublish")}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Report Form */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Title Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-[#2D2D2D] font-medium font-iransans"
                >
                  {t("reportTitle")} *
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder={t("reportTitlePlaceholder")}
                  className={cn(
                    "h-12 rounded-xl border-2 font-iransans",
                    fieldErrors.title && "border-[#FF4135]"
                  )}
                />
                {fieldErrors.title && (
                  <p className="text-sm text-[#FF4135] font-iransans">
                    {fieldErrors.title}
                  </p>
                )}
              </div>

              {/* Token Selection */}
              <div className="space-y-2">
                <Label
                  htmlFor="token"
                  className="text-[#2D2D2D] font-medium font-iransans"
                >
                  {t("selectToken")} *
                </Label>
                <Select
                  value={formData.token}
                  onValueChange={(value) => handleInputChange("token", value)}
                  className={cn(
                    "h-12 rounded-xl border-2 font-iransans",
                    fieldErrors.token && "border-[#FF4135]"
                  )}
                  disabled={loadingTokens}
                >
                  <option value="" disabled>
                    {loadingTokens
                      ? t("loadingTokens")
                      : t("selectTokenPlaceholder")}
                  </option>
                  {tokenOptions?.map((token) => (
                    <option key={token.id} value={token.id.toString()}>
                      {token.token_name} ({token.token_symbol})
                    </option>
                  ))}
                </Select>
                {fieldErrors.token && (
                  <p className="text-sm text-[#FF4135] font-iransans">
                    {fieldErrors.token}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-[#2D2D2D] font-medium font-iransans"
                >
                  {t("description")} ({t("optional")})
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder={t("descriptionPlaceholder")}
                  rows={4}
                  className={cn(
                    "rounded-xl border-2 font-iransans resize-none",
                    fieldErrors.description && "border-[#FF4135]"
                  )}
                />
                {fieldErrors.description && (
                  <p className="text-sm text-[#FF4135] font-iransans">
                    {fieldErrors.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 h-12 rounded-xl border-2 font-iransans"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateReport}
                  disabled={createReportMutation.isPending}
                  className="flex-1 h-12 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white font-iransans rounded-xl hover:scale-105 transition-all duration-200"
                >
                  {createReportMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("creating")}
                    </div>
                  ) : (
                    t("nextAddFiles")
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: File Upload */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* File Upload Area */}
              <div className="space-y-4">
                <Label className="text-[#2D2D2D] font-medium font-iransans">
                  {t("attachmentsOptional")}
                </Label>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#FF4135] transition-colors duration-200">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-iransans mb-4">
                    {t("dragDropFiles")}
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                    className="font-iransans"
                  >
                    {t("selectFiles")}
                  </Button>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-[#2D2D2D] font-medium font-iransans">
                      {t("selectedFiles")} ({selectedFiles.length})
                    </Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-[#2D2D2D] font-iransans">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500 font-iransans">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-gray-500 hover:text-[#FF4135]"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 h-12 rounded-xl border-2 font-iransans"
                >
                  {t("back")}
                </Button>
                <Button
                  type="button"
                  onClick={handleUploadFiles}
                  disabled={uploadAttachmentsMutation.isPending}
                  className="flex-1 h-12 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white font-iransans rounded-xl hover:scale-105 transition-all duration-200"
                >
                  {uploadAttachmentsMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("uploading")}
                    </div>
                  ) : (
                    t("nextReview")
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Publish */}
          {currentStep === 3 && createdReport && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800 font-iransans">
                    {t("reportCreatedSuccessfully")}
                  </p>
                  <p className="text-sm text-green-600 font-iransans">
                    {t("reportId")}: {createdReport.id}
                  </p>
                </div>
              </div>

              {/* Report Summary */}
              <div className="space-y-4">
                <Label className="text-[#2D2D2D] font-medium font-iransans">
                  {t("reportSummary")}
                </Label>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div>
                    <span className="text-sm text-gray-600 font-iransans">
                      {t("title")}:
                    </span>
                    <p className="font-medium text-[#2D2D2D] font-iransans">
                      {formData.title}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-iransans">
                      {t("token")}:
                    </span>
                    <p className="font-medium text-[#2D2D2D] font-iransans">
                      {
                        tokenOptions?.find(
                          (token) => token.id.toString() === formData.token
                        )?.token_name
                      }
                    </p>
                  </div>
                  {formData.description && (
                    <div>
                      <span className="text-sm text-gray-600 font-iransans">
                        {t("description")}:
                      </span>
                      <p className="font-medium text-[#2D2D2D] font-iransans">
                        {formData.description}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-600 font-iransans">
                      {t("files")}:
                    </span>
                    <p className="font-medium text-[#2D2D2D] font-iransans">
                      {selectedFiles.length} {t("filesAttached")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePublishReport(false)}
                  className="flex-1 h-12 rounded-xl border-2 font-iransans"
                >
                  {t("saveAsDraft")}
                </Button>
                <Button
                  type="button"
                  onClick={() => handlePublishReport(true)}
                  disabled={togglePublishMutation.isPending}
                  className="flex-1 h-12 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white font-iransans rounded-xl hover:scale-105 transition-all duration-200"
                >
                  {togglePublishMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("publishing")}
                    </div>
                  ) : (
                    t("publishReport")
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
