"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuthStore } from "@/lib/auth/authStore";
import { cn } from "@/lib/utils";

/**
 * Transparency Login Form Component
 * Simplified login form that directly uses authService to avoid context issues
 */
export default function TransparencyLoginForm({ onSuccess, className }) {
  const t = useTranslations("login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

    // Clear general error when user starts typing
    if (error) {
      setError(null);
    }
  };

  /**
   * Validate form fields
   */
  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = t("usernameRequired");
    }

    if (!formData.password) {
      errors.password = t("passwordRequired");
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use Zustand store's login method which handles storing auth data
      const authData = await useAuthStore.getState().login(formData);
      console.log("Login successful, auth data:", authData);

      // Verify the token was stored
      const storedToken = useAuthStore.getState().accessToken;
      console.log("Token stored in store:", !!storedToken);

      onSuccess?.();
    } catch (error) {
      console.error("Login failed:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Get error message based on error type
   */
  const getErrorMessage = (error) => {
    if (!error) return "";

    if (typeof error === "string") {
      return error;
    }

    if (error.message) {
      // Map common error messages to translations
      if (
        error.message.includes("Invalid credentials") ||
        error.message.includes("400")
      ) {
        return t("invalidCredentials");
      }
      if (error.message.includes("timeout")) {
        return t("timeoutError");
      }
      if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        return t("networkError");
      }
      return error.message;
    }

    return t("unexpectedError");
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error Message */}
            {error && (
              <div className="p-4 text-sm text-[#FF4135] bg-gradient-to-r from-[#FF5D1B]/10 to-[#FF363E]/10 border border-[#FF4135]/20 rounded-xl font-iransans">
                {getErrorMessage(error)}
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-3">
              <Label
                htmlFor="username"
                className="text-[#2D2D2D] font-medium font-iransans text-sm"
              >
                {t("username")}
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  placeholder={t("usernamePlaceholder")}
                  disabled={isLoading}
                  className={cn(
                    "h-12 px-4 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm transition-all duration-200 font-iransans",
                    "focus:border-[#FF4135] focus:ring-2 focus:ring-[#FF4135]/20 focus:bg-white",
                    "hover:border-gray-300 hover:bg-white/70",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    fieldErrors.username &&
                      "border-[#FF4135] focus:border-[#FF4135] bg-[#FF4135]/5"
                  )}
                  autoComplete="username"
                  dir="ltr"
                />
              </div>
              {fieldErrors.username && (
                <p className="text-sm text-[#FF4135] font-iransans">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <Label
                htmlFor="password"
                className="text-[#2D2D2D] font-medium font-iransans text-sm"
              >
                {t("password")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder={t("passwordPlaceholder")}
                  disabled={isLoading}
                  className={cn(
                    "h-12 px-4 pr-12 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm transition-all duration-200 font-iransans",
                    "focus:border-[#FF4135] focus:ring-2 focus:ring-[#FF4135]/20 focus:bg-white",
                    "hover:border-gray-300 hover:bg-white/70",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    fieldErrors.password &&
                      "border-[#FF4135] focus:border-[#FF4135] bg-[#FF4135]/5"
                  )}
                  autoComplete="current-password"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#FF4135] focus:outline-none transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-[#FF4135] font-iransans">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className={cn(
                "w-full h-12 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white font-medium font-iransans rounded-xl transition-all duration-200",
                "hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25",
                "active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none",
                "focus:ring-2 focus:ring-[#FF4135]/20 focus:outline-none"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t("loggingIn")}</span>
                </div>
              ) : (
                t("loginButton")
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
