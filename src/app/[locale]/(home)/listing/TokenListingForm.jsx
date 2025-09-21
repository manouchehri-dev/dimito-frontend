"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useApiMutationFormData } from "@/lib/api";
import JSZip from "jszip";
import {
  User,
  Mail,
  Phone,
  FileText,
  DollarSign,
  Percent,
  MapPin,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  X,
  FileX,
} from "lucide-react";

export default function TokenListingForm() {
  const t = useTranslations("tokenizationRequest");
  const tv = useTranslations("validation");
  const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
  const createListingMutation = useApiMutationFormData(
    "post",
    "/presale/listings/create/",
    {
      onSuccess: (data) => {
        console.log("Listing created successfully:", data);
        setIsSubmitted(true);
      },
      onError: (error) => {
        console.error("Listing creation failed:", error);
        if (error?.response?.data?.errors) {
          setErrors(error.response.data.errors);
        }
      },
    }
  );

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    description: "",
    estimated_mine_value: "",
    capital_needed: "",
    share_amount: "",
    location: "",
    attachment: null,
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isZipping, setIsZipping] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const MAX_TOTAL_SIZE_BYTES = 150 * 1024 * 1024; // 150 MB

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFileSizeError, setShowFileSizeError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [showFileErrorToast, setShowFileErrorToast] = useState(false);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  // Spam prevention states
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [submitCount, setSubmitCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  // Reset submission count and blocked state after 10 minutes
  useEffect(() => {
    if (submitCount > 0 || isBlocked) {
      const resetTimer = setTimeout(() => {
        setSubmitCount(0);
        setIsBlocked(false);
        setErrors(prev => ({ ...prev, general: "" }));
      }, 10 * 60 * 1000); // 10 minutes

      return () => clearTimeout(resetTimer);
    }
  }, [submitCount, isBlocked]);

  const scrollToFirstError = (errors) => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField && formRef.current) {
      const errorElement = formRef.current.querySelector(`[name="${firstErrorField}"]`) ||
        formRef.current.querySelector(`#${firstErrorField}`);
      if (errorElement) {
        errorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        errorElement.focus();
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = tv("firstNameRequired") || "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = tv("lastNameRequired") || "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = tv("emailRequired") || "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = tv("emailInvalid") || "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = tv("phoneRequired") || "Phone number is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = tv("projectDescriptionRequired") || "Project description is required";
    }

    if (!formData.estimated_mine_value) {
      newErrors.estimated_mine_value = tv("estimatedValueRequired") || "Estimated value is required";
    }

    if (!formData.capital_needed) {
      newErrors.capital_needed = tv("capitalNeededRequired") || "Capital needed is required";
    }

    if (!formData.share_amount) {
      newErrors.share_amount = tv("shareAmountRequired") || "Share amount is required";
    } else if (formData.share_amount < 0 || formData.share_amount > 100) {
      newErrors.share_amount = tv("shareAmountRange") || "Share amount must be between 0 and 100";
    }

    if (!formData.location.trim()) {
      newErrors.location = tv("locationRequired") || "Location is required";
    }

    if (selectedFiles.length === 0) {
      newErrors.attachment = tv("documentsRequired") || "At least one document is required";
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const getTotalSize = (files) => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  const processFiles = (files) => {
    if (files.length === 0) return;

    // Check for duplicate files
    const existingFileNames = selectedFiles.map(f => f.name.toLowerCase());
    const duplicateFiles = files.filter(file =>
      existingFileNames.includes(file.name.toLowerCase())
    );

    if (duplicateFiles.length > 0) {
      const duplicateNames = duplicateFiles.map(f => f.name).join(", ");
      const errorMsg = t("duplicateFilesError", {
        duplicates: duplicateNames
      }) || `Duplicate files detected: ${duplicateNames}. Please remove duplicates and try again.`;
      setFileError({
        type: 'duplicate',
        message: errorMsg,
        files: duplicateFiles.map(f => f.name)
      });
      setShowFileErrorToast(true);
      setTimeout(() => setShowFileErrorToast(false), 5000);
      return;
    }

    // Filter out files that would be duplicates
    const uniqueFiles = files.filter(file =>
      !existingFileNames.includes(file.name.toLowerCase())
    );

    if (uniqueFiles.length === 0) return;

    // Calculate current total size
    const currentTotalSize = getTotalSize(selectedFiles);
    const newFilesSize = uniqueFiles.reduce((total, file) => total + file.size, 0);

    // Check if adding these files would exceed total size limit
    if (currentTotalSize + newFilesSize > MAX_TOTAL_SIZE_BYTES) {
      const remainingSize = MAX_TOTAL_SIZE_BYTES - currentTotalSize;
      const errorMsg = t("totalSizeExceeded") || `Total file size would exceed 150MB limit. You have ${(remainingSize / (1024 * 1024)).toFixed(1)}MB remaining.`;
      setFileError({
        type: 'size',
        message: errorMsg,
        remainingSize: (remainingSize / (1024 * 1024)).toFixed(1)
      });
      setShowFileErrorToast(true);
      setTimeout(() => setShowFileErrorToast(false), 5000);
      return;
    }

    // Add new files to selected files
    const newFiles = uniqueFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);

    // Clear file errors
    if (errors.attachment) {
      setErrors((prev) => ({
        ...prev,
        attachment: "",
      }));
    }
    setFileError(null);
    setShowFileErrorToast(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
    // Reset input
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(0);
    setIsUploading(false);
  };

  const removeAllFiles = () => {
    setSelectedFiles([]);
    setFormData((prev) => ({ ...prev, attachment: null }));
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const createZipFile = async (files) => {
    const zip = new JSZip();

    for (const fileData of files) {
      zip.file(fileData.name, fileData.file);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipFile = new File([zipBlob], "documents.zip", { type: "application/zip" });

    return zipFile;
  };

  const FileSizeErrorModal = () => {
    if (!showFileSizeError) return null;

    return (
      <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-100 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-red-800">
                  {tv("fileTooLarge") || "File Too Large"}
                </h3>
              </div>
              <button
                onClick={() => setShowFileSizeError(false)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-700 mb-4">
              {tv("totalSizeExceeded") || "Total file size exceeds the 150MB limit. Please remove some files or choose smaller files."}
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600">
                <strong>{tv("supportedFormats") || "Supported formats:"}:</strong> PDF, DOC, DOCX, TXT, JPG, PNG, ZIP
              </p>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end">
            <Button
              onClick={() => setShowFileSizeError(false)}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              {tv("gotIt") || "Got it"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const FilesList = () => {
    if (selectedFiles.length === 0 && !isUploading && !isZipping) return null;

    return (
      <div className="mt-4 space-y-3">
        {selectedFiles.map((fileData) => (
          <div key={fileData.id} className="p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    {fileData.name}
                  </span>
                  <div className="text-xs text-gray-500">
                    {(fileData.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeFile(fileData.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {selectedFiles.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-700">
              {selectedFiles.length} {selectedFiles.length === 1 ? (t("fileSelected") || "file selected") : (t("filesSelected") || "files selected")}
              <div className="text-xs text-blue-600 mt-1">
                {t("totalSizeDisplay", {
                  current: (getTotalSize(selectedFiles) / (1024 * 1024)).toFixed(1),
                  remaining: ((MAX_TOTAL_SIZE_BYTES - getTotalSize(selectedFiles)) / (1024 * 1024)).toFixed(1)
                }) || `Total size: ${(getTotalSize(selectedFiles) / (1024 * 1024)).toFixed(1)}MB / 150MB (${((MAX_TOTAL_SIZE_BYTES - getTotalSize(selectedFiles)) / (1024 * 1024)).toFixed(1)}MB remaining)`}
              </div>
            </div>
            <button
              onClick={removeAllFiles}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
              type="button"
            >
              {t("clearAll") || "Clear All"}
            </button>
          </div>
        )}

        {(isUploading || isZipping) && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{isZipping ? "Creating ZIP file..." : (t("uploading") || "Uploading...")}:</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Rate Limiting - Prevent rapid submissions
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime;
    const MIN_SUBMIT_INTERVAL = 5000; // 5 seconds between submissions (longer for complex forms)

    if (timeSinceLastSubmit < MIN_SUBMIT_INTERVAL) {
      const remainingTime = Math.ceil((MIN_SUBMIT_INTERVAL - timeSinceLastSubmit) / 1000);
      setErrors(prev => ({
        ...prev,
        general: t("pleaseWait", { seconds: remainingTime }) || `Please wait ${remainingTime} seconds before submitting again`
      }));
      return;
    }

    // 2. Submission Count Limiting - Max 3 attempts per session
    if (submitCount >= 3) {
      setIsBlocked(true);
      setErrors(prev => ({
        ...prev,
        general: t("maxAttemptsReached") || "Maximum attempts reached. Please refresh the page to try again."
      }));
      return;
    }

    // 3. Honeypot check (if honeypot field exists and has value, it's likely a bot)
    const honeypot = document.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      // Silently fail for bots
      setTimeout(() => {
        setErrors(prev => ({
          ...prev,
          general: t("submissionError") || "Submission error. Please try again."
        }));
      }, 2000);
      return;
    }

    // 4. Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      scrollToFirstError(validationErrors);
      return;
    }

    // Update rate limiting counters
    setLastSubmitTime(now);
    setSubmitCount(prev => prev + 1);

    // Create ZIP file if there are selected files
    let zipFile = null;
    if (selectedFiles.length > 0) {
      try {
        setIsZipping(true);
        setUploadProgress(0);

        // Simulate progress for zipping
        const zipInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(zipInterval);
              return 90;
            }
            return prev + 15;
          });
        }, 200);

        zipFile = await createZipFile(selectedFiles);

        clearInterval(zipInterval);
        setUploadProgress(100);
        setIsZipping(false);

      } catch (error) {
        console.error("Error creating ZIP file:", error);
        setErrors((prev) => ({
          ...prev,
          attachment: "Error creating ZIP file. Please try again.",
        }));
        setIsZipping(false);
        return;
      }
    }

    // Create FormData for submission
    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== 'attachment' && formData[key] !== null && formData[key] !== "") {
        submitData.append(key, formData[key]);
      }
    });

    // Add ZIP file if created
    if (zipFile) {
      submitData.append('attachment', zipFile);
    }

    createListingMutation.mutate(submitData);
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      description: "",
      estimated_mine_value: "",
      capital_needed: "",
      share_amount: "",
      location: "",
      attachment: null,
    });
    setSelectedFiles([]);
    setErrors({});
  };

  if (isSubmitted && !createListingMutation.isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("successTitle")}
            </h2>
            <p className="text-gray-600 mb-6">{t("successMessage")}</p>
            <Button
              onClick={resetForm}
              className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4135] hover:to-[#FF2A32] text-white"
            >
              {t("submitAnother")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 pt-[140px] lg:pt-[180px]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Form */}
        {/* File Error Toast */}
        {showFileErrorToast && fileError && (
          <div className="fixed top-4 right-4 z-50 max-w-md bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 animate-in slide-in-from-right duration-300">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  {fileError.type === 'duplicate' ? (t("duplicateFiles") || "Duplicate Files") : (t("fileSizeError") || "File Size Error")}
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {fileError.message}
                </p>
                {fileError.type === 'duplicate' && fileError.files && (
                  <ul className="mt-2 text-xs text-red-600">
                    {fileError.files.map((fileName, index) => (
                      <li key={index} className="truncate">• {fileName}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                onClick={() => setShowFileErrorToast(false)}
                className="ml-2 flex-shrink-0 text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 pt-6 lg:px-8 lg:pt-8">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 flex items-center gap-1">
                <span className="text-red-500 mr-1">*</span>
                {t("requiredFieldsNote") || "Required fields are marked with an asterisk"}
              </p>
            </div>
          </div>
          <form ref={formRef} onSubmit={handleSubmit} className="px-6 pb-6 lg:px-9 lg:pb-9">
            {/* Honeypot field - Hidden from users, visible to bots */}
            <input
              type="text"
              name="website"
              tabIndex="-1"
              autoComplete="off"
              style={{
                position: 'absolute',
                left: '-9999px',
                width: '1px',
                height: '1px',
                opacity: 0,
                pointerEvents: 'none'
              }}
              aria-hidden="true"
            />

            {/* Personal Information Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#FF5D1B]" />
                {t("personalInfo")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("firstName")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] transition-colors ${errors.first_name ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-300"
                      }`}
                    placeholder={t("firstNamePlaceholder")}
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("lastName")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] ${errors.last_name ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder={t("lastNamePlaceholder")}
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.last_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    {t("email")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] ${errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder={t("emailPlaceholder")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    {t("phone")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] ${errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder={t("phonePlaceholder")}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Project Information Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FF5D1B]" />
                {t("projectInfo")}
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    {t("projectDescription")} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] ${errors.description ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder={t("descriptionPlaceholder")}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      {t("estimatedMineValue")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="estimated_mine_value"
                      value={formData.estimated_mine_value}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] ${errors.estimated_mine_value
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                      placeholder={t("estimatedValuePlaceholder")}
                    />
                    {errors.estimated_mine_value && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.estimated_mine_value}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      {t("capitalNeeded")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="capital_needed"
                      value={formData.capital_needed}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] ${errors.capital_needed
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                      placeholder={t("capitalNeededPlaceholder")}
                    />
                    {errors.capital_needed && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.capital_needed}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Percent className="w-4 h-4 inline mr-1" />
                      {t("shareAmount")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="share_amount"
                      value={formData.share_amount}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] ${errors.share_amount
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                      placeholder={t("shareAmountPlaceholder")}
                    />
                    {errors.share_amount && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.share_amount}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {t("location")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] ${errors.location ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder={t("locationPlaceholder")}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Documentation Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#FF5D1B]" />
                {t("documentation")}
              </h2>
              <div id="attachment">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("documents")} <span className="text-red-500">*</span> <span className="text-sm text-gray-500">(Max 150MB total)</span>
                </label>
                {getTotalSize(selectedFiles) < MAX_TOTAL_SIZE_BYTES && (
                  <div
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${isDragOver
                      ? 'border-[#FF5D1B] bg-orange-50'
                      : 'border-gray-300 hover:border-[#FF5D1B]'
                      }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col space-y-1 text-center items-center">
                      <Upload className={`mx-auto h-12 w-12 ${isDragOver ? 'text-[#FF5D1B]' : 'text-gray-400'
                        }`} />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#FF5D1B] hover:text-[#FF4135] focus-within:outline-none">
                          <span>{selectedFiles.length > 0 ? t("addMoreFiles") || "Add More Files" : t("uploadFile")}&nbsp;</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
                            multiple
                          />
                        </label>
                        <p className="pl-1">{t("orDragDrop")}</p>
                      </div>
                      <p className="text-xs text-gray-500">{t("totalSizeLimit") || "PDF, DOC, DOCX, TXT, JPG, PNG, ZIP - Total size limit: 150MB"}</p>
                      {isDragOver && (
                        <p className="text-xs text-[#FF5D1B] font-medium mt-2">
                          {t("dropFilesHere") || "Drop files here to upload"}
                        </p>
                      )}
                      {errors.attachment && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.attachment}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <FilesList />
                <p className="text-sm text-gray-500 mt-2">
                  {t("documentsHelp")}
                </p>
              </div>
            </div>

            {/* General Error Display (Spam Prevention) */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">
                    {errors.general}
                  </span>
                </div>
              </div>
            )}

            {/* API Error Display */}
            {createListingMutation.isError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">
                    {createListingMutation.error?.response?.data?.message ||
                      t("submissionError")}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={createListingMutation.isPending || isBlocked}
                className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4135] hover:to-[#FF2A32] text-white px-8 py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {createListingMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t("submitting")}
                  </>
                ) : (
                  t("submit")
                )}
              </Button>
            </div>
          </form>
        </div>
        <FileSizeErrorModal />
      </div>
    </div>
  );
}
