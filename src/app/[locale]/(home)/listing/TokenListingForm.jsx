"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useApiMutationFormData } from "@/lib/api";
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
} from "lucide-react";

export default function TokenListingForm() {
  const t = useTranslations("tokenizationRequest");
  const tv = useTranslations("validation");
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

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = tv("firstNameRequired");
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = tv("lastNameRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = tv("emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = tv("email");
    }

    if (!formData.phone.trim()) {
      newErrors.phone = tv("phoneRequired");
    }

    if (!formData.description.trim()) {
      newErrors.description = tv("projectDescriptionRequired");
    }

    if (!formData.estimated_mine_value) {
      newErrors.estimated_mine_value = tv("estimatedValueRequired");
    } else if (parseFloat(formData.estimated_mine_value) <= 0) {
      newErrors.estimated_mine_value = tv("positiveNumber");
    }

    if (!formData.capital_needed) {
      newErrors.capital_needed = tv("capitalNeededRequired");
    } else if (parseFloat(formData.capital_needed) <= 0) {
      newErrors.capital_needed = tv("positiveNumber");
    }

    if (!formData.share_amount) {
      newErrors.share_amount = tv("shareAmountRequired");
    } else {
      const share = parseFloat(formData.share_amount);
      if (share <= 0 || share > 100) {
        newErrors.share_amount = tv("shareAmountRange");
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = tv("locationRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      attachment: file,
    }));

    // Clear file error
    if (errors.attachment) {
      setErrors((prev) => ({
        ...prev,
        attachment: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("here");

    if (!validateForm()) {
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        submitData.append(key, formData[key]);
      }
    });

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
    setErrors({});
  };

  if (isSubmitted && !createListingMutation.isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
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
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 lg:p-8">
            {/* Personal Information Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#FF5D1B]" />
                {t("personalInfo")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("firstName")}
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] ${
                      errors.first_name ? "border-red-500" : "border-gray-300"
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
                    {t("lastName")}
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] ${
                      errors.last_name ? "border-red-500" : "border-gray-300"
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
                    {t("email")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] ${
                      errors.email ? "border-red-500" : "border-gray-300"
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
                    {t("phone")}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] ${
                      errors.phone ? "border-red-500" : "border-gray-300"
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
                    {t("projectDescription")}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] ${
                      errors.description ? "border-red-500" : "border-gray-300"
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
                      {t("estimatedMineValue")}
                    </label>
                    <input
                      type="number"
                      name="estimated_mine_value"
                      value={formData.estimated_mine_value}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] ${
                        errors.estimated_mine_value
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
                      {t("capitalNeeded")}
                    </label>
                    <input
                      type="number"
                      name="capital_needed"
                      value={formData.capital_needed}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] ${
                        errors.capital_needed
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
                      {t("shareAmount")}
                    </label>
                    <input
                      type="number"
                      name="share_amount"
                      value={formData.share_amount}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] ${
                        errors.share_amount
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
                    {t("location")}
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-[#FF5D1B] ${
                      errors.location ? "border-red-500" : "border-gray-300"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("documents")}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#FF5D1B] transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#FF5D1B] hover:text-[#FF4135] focus-within:outline-none">
                        <span>{t("uploadFile")}</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.zip"
                        />
                      </label>
                      <p className="pl-1">{t("orDragDrop")}</p>
                    </div>
                    <p className="text-xs text-gray-500">{t("fileFormats")}</p>
                    {formData.attachment && (
                      <p className="text-sm text-green-600 mt-2">
                        {t("selectedFile")}: {formData.attachment.name}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {t("documentsHelp")}
                </p>
              </div>
            </div>

            {/* Error Display */}
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
                disabled={createListingMutation.isPending}
                className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4135] hover:to-[#FF2A32] text-white px-8 py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
}
