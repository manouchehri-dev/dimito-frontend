"use client";

import React, { useState } from "react";
import DateObject from "react-date-object";
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { useTranslations } from "next-intl";

const CreateDMTForm = () => {
  const t = useTranslations("createDMT");

  // Predefined payment tokens
  const paymentTokens = [
    { name: "USDT_FAKE", address: "0x2adFDf2354116a09c7dA522070e47f66d7717C57", symbol: "USDTF" },
    { name: "USDT", address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDC" },
  ];

  const [formData, setFormData] = useState({
    paymentToken: "",
    pricePerToken: "",
    startDate: new DateObject(),
    endDate: new DateObject().add(7, "days"), // Default to 7 days from now
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate payment token selection
    if (!formData.paymentToken) {
      newErrors.paymentToken = t("paymentTokenRequired");
    }

    // Validate price per token
    if (!formData.pricePerToken) {
      newErrors.pricePerToken = t("pricePerTokenRequired");
    } else if (isNaN(formData.pricePerToken) || parseFloat(formData.pricePerToken) <= 0) {
      newErrors.pricePerToken = t("pricePerTokenInvalid");
    }

    // Validate dates
    if (!formData.startDate) {
      newErrors.startDate = t("startDateRequired");
    }

    if (!formData.endDate) {
      newErrors.endDate = t("endDateRequired");
    }

    if (formData.startDate && formData.endDate) {
      if (formData.endDate.toUnix() <= formData.startDate.toUnix()) {
        newErrors.endDate = t("endDateInvalid");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Get selected token details
    const selectedToken = paymentTokens.find(token => token.address === formData.paymentToken);

    // Convert dates to Unix timestamps
    const submissionData = {
      paymentToken: {
        name: selectedToken?.name,
        address: selectedToken?.address,
        symbol: selectedToken?.symbol,
      },
      pricePerToken: parseFloat(formData.pricePerToken),
      startDate: formData.startDate.toUnix(),
      endDate: formData.endDate.toUnix(),
    };

    console.log("Form submitted with data:", submissionData);

    // Here you would typically call your smart contract
    // For now, just log the data
    alert(t("formSubmitted"));
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 lg:px-[72px]">
      <div className="max-w-4xl mx-auto pt-[100px] lg:pt-[140px]">

        {/* Form Card */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl lg:rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl lg:text-2xl font-bold text-center text-primary">
              {t("title")}
            </CardTitle>
            <p className="text-sm text-gray-500 text-center mt-2">
              {t("required")}
            </p>
          </CardHeader>

          <CardContent className="p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
              {/* Payment Token Selection */}
              <div className="space-y-3">
                <Label
                  htmlFor="paymentToken"
                  className="text-base lg:text-lg font-semibold text-primary flex items-center gap-2"
                >
                  {t("paymentToken")}
                  <span className="text-[#FF4135]">*</span>
                </Label>
                <Select
                  value={formData.paymentToken}

                  onValueChange={(value) => handleInputChange("paymentToken", value)}
                  className={`h-12 lg:h-14 text-base lg:text-lg rounded-xl border-2 transition-all duration-200 ${errors.paymentToken
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-[#FF4135] focus:ring-[#FF4135]/20"
                    }`}
                >
                  <SelectItem value="USDT" disabled>
                    {t("paymentTokenPlaceholder")}
                  </SelectItem>
                  {paymentTokens.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      {token.name} ({token.symbol})
                    </SelectItem>
                  ))}
                </Select>
                {errors.paymentToken && (
                  <p className="text-sm text-red-500 flex items-center gap-2 mt-2">
                    <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">!</span>
                    {errors.paymentToken}
                  </p>
                )}
              </div>

              {/* Price Per Token */}
              <div className="space-y-3">
                <Label
                  htmlFor="pricePerToken"
                  className="text-base lg:text-lg font-semibold text-primary flex items-center gap-2"
                >
                  {t("pricePerToken")}
                  <span className="text-[#FF4135]">*</span>
                </Label>
                <Input
                  id="pricePerToken"
                  type="number"
                  step="0.000000000000000001"
                  placeholder={t("pricePerTokenPlaceholder")}
                  value={formData.pricePerToken}
                  onChange={(e) => handleInputChange("pricePerToken", e.target.value)}
                  className={`h-12 lg:h-14 text-base lg:text-lg rounded-xl border-2 transition-all duration-200 ${errors.pricePerToken
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-[#FF4135] focus:ring-[#FF4135]/20"
                    }`}
                />
                {errors.pricePerToken && (
                  <p className="text-sm text-red-500 flex items-center gap-2 mt-2">
                    <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">!</span>
                    {errors.pricePerToken}
                  </p>
                )}
              </div>

              {/* Date Selection Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Start Date */}
                <div className="space-y-3">
                  <Label
                    htmlFor="startDate"
                    className="text-base lg:text-lg font-semibold text-primary flex items-center gap-2"
                  >
                    {t("startDate")}
                    <span className="text-[#FF4135]">*</span>
                  </Label>
                  <div className="relative">
                    <DatePicker
                      value={formData.startDate}
                      onChange={(date) => handleInputChange("startDate", date)}
                      format="YYYY-MM-DD HH:mm"
                      plugins={[
                        <TimePicker key="time" position="bottom" />
                      ]}
                      render={(value, openCalendar) => (
                        <Input
                          value={value}
                          onClick={openCalendar}
                          readOnly
                          placeholder={t("startDatePlaceholder")}
                          className={`h-12 lg:h-14 text-base lg:text-lg rounded-xl border-2 cursor-pointer transition-all duration-200 ${errors.startDate
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-200 focus:border-[#FF4135] focus:ring-[#FF4135]/20"
                            }`}
                        />
                      )}
                    />
                  </div>
                  {errors.startDate && (
                    <p className="text-sm text-red-500 flex items-center gap-2 mt-2">
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">!</span>
                      {errors.startDate}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div className="space-y-3">
                  <Label
                    htmlFor="endDate"
                    className="text-base lg:text-lg font-semibold text-primary flex items-center gap-2"
                  >
                    {t("endDate")}
                    <span className="text-[#FF4135]">*</span>
                  </Label>
                  <div className="relative">
                    <DatePicker
                      value={formData.endDate}
                      onChange={(date) => handleInputChange("endDate", date)}
                      format="YYYY-MM-DD HH:mm"
                      plugins={[
                        <TimePicker key="time" position="bottom" />
                      ]}
                      render={(value, openCalendar) => (
                        <Input
                          value={value}
                          onClick={openCalendar}
                          readOnly
                          placeholder={t("endDatePlaceholder")}
                          className={`h-12 lg:h-14 text-base lg:text-lg rounded-xl border-2 cursor-pointer transition-all duration-200 ${errors.endDate
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-200 focus:border-[#FF4135] focus:ring-[#FF4135]/20"
                            }`}
                        />
                      )}
                    />
                  </div>
                  {errors.endDate && (
                    <p className="text-sm text-red-500 flex items-center gap-2 mt-2">
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">!</span>
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 lg:pt-8">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4135] hover:to-[#FF2D1B] text-white font-semibold text-base lg:text-lg h-12 lg:h-16 rounded-xl lg:rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/25 active:scale-[0.98] cursor-pointer"
                >
                  {t("createToken")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateDMTForm;
