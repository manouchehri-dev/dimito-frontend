"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import useAuthStore from "@/stores/useAuthStore";

export default function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");
  const { loginWithSSO } = useAuthStore();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const token = searchParams.get("token");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        // Get JWT expiry metadata from URL (provided by backend)
        const jwtExp = searchParams.get("jwt_exp");
        const jwtIat = searchParams.get("jwt_iat");
        const expiresIn = searchParams.get("expires_in");

        // Check for user data in URL parameters
        const userDataParam = searchParams.get("user");

        console.log("URL parameters:", {
          hasToken: !!token,
          error,
          hasUserData: !!userDataParam,
          expiryData: { jwtExp, jwtIat, expiresIn },
        });

        if (error) {
          // Handle authentication error
          setStatus("error");
          setMessage(errorDescription || t("authenticationFailed"));

          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
          return;
        }

        if (token) {
          try {
            let userData;
            let exp;

            // Use backend-provided expiry (BEST PRACTICE)
            if (jwtExp) {
              exp = parseInt(jwtExp);
              console.log("✅ Using backend-provided JWT expiry:", {
                exp,
                expiresAt: new Date(exp * 1000).toISOString(),
                expiresIn: expiresIn ? `${expiresIn}s` : "unknown",
              });
            } else {
              // Fallback: decode JWT token to check expiration
              const payload = JSON.parse(atob(token.split(".")[1]));
              exp = payload.exp;
              console.warn(
                "⚠️ Backend did not provide expiry, decoded JWT instead"
              );
            }

            // Check if token is expired
            const now = Math.floor(Date.now() / 1000);
            if (exp <= now) {
              throw new Error("Token expired");
            }

            // Try to get user data from URL parameters first
            if (userDataParam) {
              try {
                userData = JSON.parse(decodeURIComponent(userDataParam));
                console.log("✅ User data from URL:", userData);
              } catch (parseError) {
                console.error("Error parsing user data from URL:", parseError);
                userData = null;
              }
            }

            // Fallback to JWT payload if no URL user data
            if (!userData) {
              const payload = JSON.parse(atob(token.split(".")[1]));
              userData = {
                id: payload.user_id || payload.id,
                username: payload.username || "",
                email: payload.email || "",
                first_name: payload.first_name || "",
                last_name: payload.last_name || "",
                phone_number: payload.phone_number || null,
              };
              console.log("User data from JWT payload:", userData);
            }

            // Prepare expiry data object for auth store
            const expiryData = {
              jwt_exp: exp,
              jwt_iat: jwtIat ? parseInt(jwtIat) : null,
              expires_in: expiresIn ? parseInt(expiresIn) : null,
            };

            // Update authentication state with complete user data AND expiry info
            loginWithSSO(token, userData, expiryData);

            setStatus("success");
            setMessage(t("authenticationSuccess"));

            // Redirect to dashboard after 1 second (faster redirect for better UX)
            setTimeout(() => {
              console.log("🚀 Redirecting to dashboard...");
              router.push("/dashboard");
            }, 1000);
          } catch (tokenError) {
            console.error("Error processing token:", tokenError);
            setStatus("error");
            setMessage(t("authenticationFailed"));

            setTimeout(() => {
              router.push("/auth/login");
            }, 3000);
          }
        } else {
          // No token received
          setStatus("error");
          setMessage(t("authenticationFailed"));

          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setMessage(t("authenticationFailed"));

        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, t, loginWithSSO]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header with Logo */}
          <div className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] px-8 py-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 p-1">
              <img
                src="/logo-header.png"
                alt="DiMiTo Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white">DiMiTo</h1>
          </div>

          {/* Content */}
          <div className="px-8 py-10 text-center">
            {status === "processing" && (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-6">
                  <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {t("processingAuth")}
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  {t("processingAuthDesc")}
                </p>
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </>
            )}

            {status === "success" && (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {t("authenticationSuccess")}
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  {t("authSuccessDesc")}
                </p>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-center text-green-700">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="font-medium">
                      {t("redirectingToDashboard")}
                    </span>
                  </div>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {t("authenticationFailed")}
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  {message || t("authFailedDesc")}
                </p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center justify-center text-red-700">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="font-medium">
                      {t("redirectingToLogin")}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
            <p className="text-sm text-gray-500">{t("secureAuth")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
