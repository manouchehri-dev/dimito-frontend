"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function TokenListingPage() {
  const t = useTranslations("tokenizationRequest");
  const v = useTranslations("validation");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    projectName: "",
    projectType: "",
    projectDescription: "",
    estimatedValue: "",
    location: "",
    documents: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "documents") {
      setForm({ ...form, documents: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.firstName.trim()) newErrors.firstName = v("firstNameRequired");
    if (!form.lastName.trim()) newErrors.lastName = v("lastNameRequired");
    if (!form.phone.trim()) newErrors.phone = v("phoneRequired");
    if (!form.email.trim()) newErrors.email = v("emailRequired");
    if (!form.projectName.trim())
      newErrors.projectName = v("projectNameRequired");
    if (!form.projectType) newErrors.projectType = v("projectTypeRequired");
    if (!form.projectDescription.trim())
      newErrors.projectDescription = v("projectDescriptionRequired");
    if (!form.estimatedValue.trim())
      newErrors.estimatedValue = v("estimatedValueRequired");
    if (!form.location.trim()) newErrors.location = v("locationRequired");
    if (!form.documents) newErrors.documents = v("documentsRequired");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-full text-primary px-[28px] lg:px-[72px] relative">
        <section className="pt-[100px] lg:pt-[140px] pb-20">
          {/* Background images */}
          <div className="pointer-events-none absolute top-0 left-0 -z-10 overflow-hidden">
            <img
              src="/hero/left-desktop.png"
              alt="hero-bg"
              className="hidden lg:block w-full h-full object-cover"
            />
            <img
              src="/hero/left.png"
              alt="hero-bg"
              className="block lg:hidden w-full h-full object-cover"
            />
          </div>
          <div className="pointer-events-none absolute top-0 right-0 -z-10 overflow-hidden">
            <img
              src="/hero/right-desktop.png"
              alt="hero-bg"
              className="hidden lg:block w-full h-full object-cover"
            />
            <img
              src="/hero/right.png"
              alt="hero-bg"
              className="block lg:hidden w-full h-full object-cover"
            />
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[24px] p-10 shadow-lg">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <img
                    src="/logo.png"
                    alt="MID Token"
                    className="w-[71px] h-[32px]"
                  />
                  <div className="border-b border-secondary border-1 w-full" />
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold mb-4 text-primary">
                  {t("successTitle")}
                </h1>
                <p className="text-primary text-[16px] leading-[170%] max-w-2xl mx-auto">
                  {t("successMessage")}
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({
                      firstName: "",
                      lastName: "",
                      phone: "",
                      email: "",
                      projectName: "",
                      projectType: "",
                      projectDescription: "",
                      estimatedValue: "",
                      location: "",
                      documents: null,
                    });
                  }}
                  className="mt-6 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white px-6 py-3 rounded-lg hover:scale-105 transition-all duration-200"
                >
                  {t("submitAnother") || "Submit Another Request"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-full text-primary px-[28px] lg:px-[72px] relative">
      <section className="pt-[100px] lg:pt-[140px] pb-20">
        {/* Background images */}
        <div className="pointer-events-none absolute top-0 left-0 -z-10 overflow-hidden">
          <img
            src="/hero/left-desktop.png"
            alt="hero-bg"
            className="hidden lg:block w-full h-full object-cover"
          />
          <img
            src="/hero/left.png"
            alt="hero-bg"
            className="block lg:hidden w-full h-full object-cover"
          />
        </div>
        <div className="pointer-events-none absolute top-0 right-0 -z-10 overflow-hidden">
          <img
            src="/hero/right-desktop.png"
            alt="hero-bg"
            className="hidden lg:block w-full h-full object-cover"
          />
          <img
            src="/hero/right.png"
            alt="hero-bg"
            className="block lg:hidden w-full h-full object-cover"
          />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[24px] p-10 shadow-lg">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <img
                  src="/logo.png"
                  alt="MID Token"
                  className="w-[71px] h-[32px]"
                />
                <div className="border-b border-secondary border-1 w-full" />
              </div>
              <h1 className="text-3xl font-bold mb-3 text-primary">
                {t("title")}
              </h1>
              <p className="text-primary text-[16px] leading-[170%] max-w-2xl mx-auto">
                {t("subtitle")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-primary flex items-center">
                  <div className="w-8 h-8 bg-[#FFB30F] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                    1
                  </div>
                  {t("personalInfo")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block mb-2 font-medium text-primary text-[14px]"
                      htmlFor="firstName"
                    >
                      {t("firstName")} *
                    </label>
                    <input
                      className={`w-full border rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#FFB30F] ${
                        errors.firstName ? "border-red-500" : "border-gray-300"
                      }`}
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block mb-2 font-medium text-primary text-[14px]"
                      htmlFor="lastName"
                    >
                      {t("lastName")} *
                    </label>
                    <input
                      className={`w-full border rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#FFB30F] ${
                        errors.lastName ? "border-red-500" : "border-gray-300"
                      }`}
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block mb-2 font-medium text-primary text-[14px]"
                      htmlFor="phone"
                    >
                      {t("phone")} *
                    </label>
                    <input
                      className={`w-full border rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#FFB30F] ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      type="tel"
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block mb-2 font-medium text-primary text-[14px]"
                      htmlFor="email"
                    >
                      {t("email")} *
                    </label>
                    <input
                      className={`w-full border rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#FFB30F] ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Information Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-primary flex items-center">
                  <div className="w-8 h-8 bg-[#FFB30F] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                    2
                  </div>
                  {t("projectInfo")}
                </h2>
                <div className="space-y-6">
                  <div>
                    <label
                      className="block mb-2 font-medium text-primary text-[14px]"
                      htmlFor="projectName"
                    >
                      {t("projectName")} *
                    </label>
                    <input
                      className={`w-full border rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#FFB30F] ${
                        errors.projectName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      type="text"
                      id="projectName"
                      name="projectName"
                      value={form.projectName}
                      onChange={handleChange}
                    />
                    {errors.projectName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.projectName}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className="block mb-2 font-medium text-primary text-[14px]"
                        htmlFor="projectType"
                      >
                        {t("projectType")} *
                      </label>
                      <select
                        className={`w-full border rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#FFB30F] ${
                          errors.projectType
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        id="projectType"
                        name="projectType"
                        value={form.projectType}
                        onChange={handleChange}
                      >
                        <option value="">{v("selectProjectType")}</option>
                        <option value="mining">
                          {t("projectTypes.mining")}
                        </option>
                        <option value="real_estate">
                          {t("projectTypes.real_estate")}
                        </option>
                        <option value="energy">
                          {t("projectTypes.energy")}
                        </option>
                        <option value="agriculture">
                          {t("projectTypes.agriculture")}
                        </option>
                        <option value="infrastructure">
                          {t("projectTypes.infrastructure")}
                        </option>
                        <option value="other">{t("projectTypes.other")}</option>
                      </select>
                      {errors.projectType && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.projectType}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className="block mb-2 font-medium text-primary text-[14px]"
                        htmlFor="estimatedValue"
                      >
                        {t("estimatedValue")} *
                      </label>
                      <input
                        className={`w-full border rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#FFB30F] ${
                          errors.estimatedValue
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        type="number"
                        id="estimatedValue"
                        name="estimatedValue"
                        value={form.estimatedValue}
                        onChange={handleChange}
                        placeholder="e.g., 1000000"
                      />
                      {errors.estimatedValue && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.estimatedValue}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      className="block mb-2 font-medium text-primary text-[14px]"
                      htmlFor="location"
                    >
                      {t("location")} *
                    </label>
                    <input
                      className={`w-full border rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#FFB30F] ${
                        errors.location ? "border-red-500" : "border-gray-300"
                      }`}
                      type="text"
                      id="location"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="City, State/Province, Country"
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.location}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block mb-2 font-medium text-primary text-[14px]"
                      htmlFor="projectDescription"
                    >
                      {t("projectDescription")} *
                    </label>
                    <textarea
                      className={`w-full border rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#FFB30F] resize-none ${
                        errors.projectDescription
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      id="projectDescription"
                      name="projectDescription"
                      rows={4}
                      value={form.projectDescription}
                      onChange={handleChange}
                      placeholder="Provide detailed information about your project, including objectives, timeline, and expected outcomes..."
                    />
                    {errors.projectDescription && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.projectDescription}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Documentation Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-primary flex items-center">
                  <div className="w-8 h-8 bg-[#FFB30F] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                    3
                  </div>
                  {t("documentation")}
                </h2>
                <div>
                  <label
                    className="block mb-2 font-medium text-primary text-[14px]"
                    htmlFor="documents"
                  >
                    {t("documents")} *
                  </label>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">
                      {t("documentsHelp")}
                    </p>
                  </div>
                  <input
                    className={`w-full border rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#FFB30F] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FFB30F] file:text-white hover:file:bg-[#FF8C00] ${
                      errors.documents ? "border-red-500" : "border-gray-300"
                    }`}
                    type="file"
                    id="documents"
                    name="documents"
                    accept=".zip"
                    onChange={handleChange}
                  />
                  {errors.documents && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.documents}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center pt-6">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white px-8 py-4 rounded-lg hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 ease-in-out font-medium text-lg"
                >
                  {t("submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
