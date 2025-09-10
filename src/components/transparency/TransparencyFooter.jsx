"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { useState, useEffect } from "react";

const Footer = () => {
  const t = useTranslations("footer");
  const isRtl = useLocale() === "fa";
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Reset subscription state after 3 seconds
  useEffect(() => {
    if (isSubscribed) {
      const timeout = setTimeout(() => {
        setIsSubscribed(false);
        setEmail("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isSubscribed]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    e.preventDefault();
    setEmailError("");

    if (!email.trim()) {
      setEmailError(t("emailRequired") || "Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(t("emailInvalid") || "Please enter a valid email");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSubscribed(true);
  };

  return (
    <footer
      dir={isRtl ? "rtl" : "ltr"}
      className="relative z-50 text-primary overflow-hidden"
      aria-labelledby="footer-heading"
    >
      {/* Enhanced Background with Gradient Overlay */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-orange-50/30" />
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/footer/left.png"
          alt=""
          priority
          fill
          className="object-cover opacity-40 mix-blend-soft-light transition-opacity duration-700 hover:opacity-60"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/footer/right.png"
          alt=""
          fill
          className="object-cover opacity-40 mix-blend-soft-light transition-opacity duration-700 hover:opacity-60"
        />
      </div>

      {/* Animated Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-2 items-center">
          {/* Compact Brand Section */}
          <div className="flex flex-col items-center lg:items-start gap-3 group">
            <div className="flex items-center gap-3 transform transition-all duration-300 group-hover:scale-105">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="DMT Token"
                  width={63}
                  height={63}
                  className="w-[29px] lg:w-[54px] h-auto transition-transform duration-300 group-hover:rotate-6"
                />
                <div className="absolute inset-0 bg-orange-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
              <h1
                id="footer-heading"
                className="text-[clamp(14px,2.2vw,28px)] font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
              >
                DMT Token
              </h1>
            </div>

            <div className="text-center lg:text-start px-3 lg:px-0">
              <p className="font-bold text-[clamp(14px,2vw,22px)] [text-wrap:balance] text-gray-800 mb-2">
                {t("subtitle")}
              </p>
              <p className="text-[clamp(12px,1.6vw,16px)] text-gray-600 max-w-sm mx-auto lg:mx-0">
                {t("description")}
              </p>
            </div>
          </div>

          {/* Compact Subscribe Section */}
          <div className="flex w-full flex-col items-center lg:items-start gap-4">
            <p className="font-bold text-[clamp(14px,2vw,22px)] text-gray-800 text-center lg:text-start">
              {t("subscribe")}
            </p>

            <form
              className="w-full max-w-md lg:max-w-none"
              onSubmit={handleSubmit}
              aria-label={t("subscribe")}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Compact Input Field */}
                <div className="flex-1 relative">
                  <label htmlFor="email" className="sr-only">
                    {t("email")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    inputMode="email"
                    placeholder={t("email")}
                    className={[
                      "w-full rounded-xl bg-white/90 font-medium shadow-md ring-1 transition-all duration-300",
                      "py-3 px-4 text-[clamp(14px,1.6vw,16px)]",
                      "placeholder:text-gray-400",
                      "focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white focus:shadow-lg",
                      "hover:shadow-lg hover:ring-orange-300/50",
                      emailError ? "ring-red-400 ring-2" : "ring-gray-200",
                    ].join(" ")}
                    dir={isRtl ? "rtl" : "ltr"}
                    disabled={isLoading || isSubscribed}
                  />
                </div>

                {/* Compact Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isSubscribed}
                  className={[
                    "sm:w-auto w-full px-6 py-3 rounded-xl font-bold text-[clamp(14px,1.6vw,16px)]",
                    "transition-all duration-300 transform",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400",
                    isSubscribed
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white shadow-md hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02]",
                    isLoading && "cursor-wait opacity-80",
                  ].join(" ")}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    )}
                    {isSubscribed ? (
                      <>
                        <svg
                          className="w-4 h-4"
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
                        Done
                      </>
                    ) : (
                      t("button")
                    )}
                  </span>
                </button>
              </div>

              {/* Compact Error/Success Messages */}
              {emailError && (
                <p className="text-red-500 text-sm mt-2 animate-in slide-in-from-top-1 duration-200">
                  {emailError}
                </p>
              )}
              {isSubscribed && (
                <p className="text-green-600 text-sm mt-2 animate-in slide-in-from-bottom-2 duration-500">
                  ✓ Successfully subscribed!
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
