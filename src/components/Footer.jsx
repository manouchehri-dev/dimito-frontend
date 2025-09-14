"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { useState, useEffect } from "react";

const Footer = () => {
  const t = useTranslations("footer");
  const locale = useLocale();
  const isRtl = locale === "fa";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");

    if (!email.trim()) {
      setEmailError(t("emailRequired"));
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(t("emailInvalid"));
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
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 xl:gap-16">
          {/* Brand Section */}
          <div className="lg:col-span-1 flex flex-col items-center lg:items-start gap-4 group">
            <Link
              href={``}
              className="flex items-center gap-3 transform transition-all duration-300 group-hover:scale-105"
            >
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="DMT Token"
                  width={63}
                  height={63}
                  className="w-[40px] lg:w-[54px] h-auto transition-transform duration-300 group-hover:rotate-6"
                />
                <div className="absolute inset-0 bg-orange-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
              <h1
                id="footer-heading"
                className={`text-[clamp(16px,2.2vw,28px)] font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent ${
                  isRtl ? "font-iransans" : "font-poppins"
                }`}
              >
                DMT Token
              </h1>
            </Link>

            <div className="text-center lg:text-start">
              <p
                className={`font-bold text-[clamp(14px,1.8vw,18px)] [text-wrap:balance] text-gray-800 mb-2 ${
                  isRtl ? "font-iransans" : "font-poppins"
                }`}
              >
                {t("subtitle")}
              </p>
              <p
                className={`text-[clamp(12px,1.4vw,14px)] text-gray-600 max-w-sm mx-auto lg:mx-0 leading-relaxed ${
                  isRtl ? "font-iransans" : "font-poppins"
                }`}
              >
                {t("description")}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col items-center lg:items-start gap-4">
            <h3
              className={`font-bold text-[clamp(14px,1.8vw,18px)] text-gray-800 ${
                isRtl ? "font-iransans" : "font-poppins"
              }`}
            >
              {isRtl ? "پیوندها" : "Navigation"}
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href={``}
                className={`text-[clamp(12px,1.4vw,14px)] text-gray-600 hover:text-orange-500 transition-all duration-200 transform ${
                  isRtl
                    ? "hover:-translate-x-1 font-iransans"
                    : "hover:translate-x-1 font-poppins"
                }`}
              >
                {t("navigation.home")}
              </Link>
              <Link
                href="/tokenomics"
                className={`text-[clamp(12px,1.4vw,14px)] text-gray-600 hover:text-orange-500 transition-all duration-200 transform ${
                  isRtl
                    ? "hover:-translate-x-1 font-iransans"
                    : "hover:translate-x-1 font-poppins"
                }`}
              >
                {t("navigation.tokenomics")}
              </Link>
              <Link
                href="/whitepaper"
                className={`text-[clamp(12px,1.4vw,14px)] text-gray-600 hover:text-orange-500 transition-all duration-200 transform ${
                  isRtl
                    ? "hover:-translate-x-1 font-iransans"
                    : "hover:translate-x-1 font-poppins"
                }`}
              >
                {t("navigation.whitepaper")}
              </Link>
              <Link
                href={`/transparency`}
                className={`text-[clamp(12px,1.4vw,14px)] text-gray-600 hover:text-orange-500 transition-all duration-200 transform ${
                  isRtl
                    ? "hover:-translate-x-1 font-iransans"
                    : "hover:translate-x-1 font-poppins"
                }`}
              >
                {t("navigation.transparency")}
              </Link>
              <Link
                href={`/transparency/login`}
                className={`text-[clamp(12px,1.4vw,14px)] text-orange-600 hover:text-orange-700 font-medium transition-all duration-200 transform ${
                  isRtl
                    ? "hover:-translate-x-1 font-iransans"
                    : "hover:translate-x-1 font-poppins"
                }`}
              >
                {t("navigation.transparencyLogin")}
              </Link>
              <Link
                href={`/dashboard`}
                className={`text-[clamp(12px,1.4vw,14px)] text-gray-600 hover:text-orange-500 transition-all duration-200 transform ${
                  isRtl
                    ? "hover:-translate-x-1 font-iransans"
                    : "hover:translate-x-1 font-poppins"
                }`}
              >
                {t("navigation.dashboard")}
              </Link>
            </nav>
          </div>

          {/* Social & Legal Links */}
          <div className="flex flex-col items-center lg:items-start gap-4">
            <h3
              className={`font-bold text-[clamp(14px,1.8vw,18px)] text-gray-800 ${
                isRtl ? "font-iransans" : "font-poppins"
              }`}
            >
              {t("social.title")}
            </h3>
            <div className="flex flex-col gap-2">
              <a
                href="#"
                className={`text-[clamp(12px,1.4vw,14px)] text-gray-600 hover:text-orange-500 transition-all duration-200 transform ${
                  isRtl
                    ? "hover:-translate-x-1 font-iransans"
                    : "hover:translate-x-1 font-poppins"
                }`}
              >
                {t("social.telegram")}
              </a>
              <a
                href="#"
                className={`text-[clamp(12px,1.4vw,14px)] text-gray-600 hover:text-orange-500 transition-all duration-200 transform ${
                  isRtl
                    ? "hover:-translate-x-1 font-iransans"
                    : "hover:translate-x-1 font-poppins"
                }`}
              >
                {t("social.twitter")}
              </a>
              <a
                href="#"
                className={`text-[clamp(12px,1.4vw,14px)] text-gray-600 hover:text-orange-500 transition-all duration-200 transform ${
                  isRtl
                    ? "hover:-translate-x-1 font-iransans"
                    : "hover:translate-x-1 font-poppins"
                }`}
              >
                {t("social.linkedin")}
              </a>
            </div>

            <div className="mt-4">
              <h4
                className={`font-semibold text-[clamp(12px,1.4vw,14px)] text-gray-700 mb-2 ${
                  isRtl ? "font-iransans" : "font-poppins"
                }`}
              >
                {isRtl ? "قانونی" : "Legal"}
              </h4>
              <div className="flex flex-col gap-1">
                <a
                  href="#"
                  className={`text-[clamp(11px,1.2vw,12px)] text-gray-500 hover:text-orange-500 transition-colors duration-200 ${
                    isRtl ? "font-iransans" : "font-poppins"
                  }`}
                >
                  {t("legal.privacy")}
                </a>
                <a
                  href="#"
                  className={`text-[clamp(11px,1.2vw,12px)] text-gray-500 hover:text-orange-500 transition-colors duration-200 ${
                    isRtl ? "font-iransans" : "font-poppins"
                  }`}
                >
                  {t("legal.terms")}
                </a>
                <a
                  href="#"
                  className={`text-[clamp(11px,1.2vw,12px)] text-gray-500 hover:text-orange-500 transition-colors duration-200 ${
                    isRtl ? "font-iransans" : "font-poppins"
                  }`}
                >
                  {t("legal.disclaimer")}
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="flex w-full flex-col items-center lg:items-start gap-4">
            <h3
              className={`font-bold text-[clamp(14px,1.8vw,18px)] text-gray-800 ${
                isRtl ? "font-iransans" : "font-poppins"
              }`}
            >
              {t("subscribe")}
            </h3>

            <form
              className="w-full max-w-md lg:max-w-none"
              onSubmit={handleSubmit}
              aria-label={t("subscribe")}
            >
              <div className="flex flex-col gap-3">
                {/* Input Field */}
                <div className="relative">
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
                    className={`
                      w-full rounded-lg bg-white/90 font-medium shadow-sm ring-1 transition-all duration-300
                      py-2.5 px-3 text-[clamp(12px,1.4vw,14px)]
                      placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white focus:shadow-md
                      hover:shadow-md hover:ring-orange-300/50
                      ${emailError ? "ring-red-400 ring-2" : "ring-gray-200"}
                      ${
                        isRtl
                          ? "font-iransans text-right"
                          : "font-poppins text-left"
                      }
                    `}
                    dir={isRtl ? "rtl" : "ltr"}
                    disabled={isLoading || isSubscribed}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isSubscribed}
                  className={`
                    w-full px-4 py-2.5 rounded-lg font-bold text-[clamp(12px,1.4vw,14px)]
                    transition-all duration-300 transform
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400
                    ${
                      isSubscribed
                        ? "bg-green-500 text-white shadow-sm"
                        : "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white shadow-sm hover:shadow-md hover:shadow-orange-500/20 hover:scale-[1.02]"
                    }
                    ${isLoading && "cursor-wait opacity-80"}
                    ${isRtl ? "font-iransans" : "font-poppins"}
                  `}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isLoading && (
                      <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    )}
                    {isSubscribed ? (
                      <>
                        <svg
                          className="w-3 h-3"
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
                        {isRtl ? "انجام شد" : "Done"}
                      </>
                    ) : isLoading ? (
                      t("subscribing")
                    ) : (
                      t("button")
                    )}
                  </span>
                </button>
              </div>

              {/* Error/Success Messages */}
              {emailError && (
                <p
                  className={`text-red-500 text-xs mt-2 animate-in slide-in-from-top-1 duration-200 ${
                    isRtl
                      ? "font-iransans text-right"
                      : "font-poppins text-left"
                  }`}
                >
                  {emailError}
                </p>
              )}
              {isSubscribed && (
                <p
                  className={`text-green-600 text-xs mt-2 animate-in slide-in-from-bottom-2 duration-500 ${
                    isRtl
                      ? "font-iransans text-right"
                      : "font-poppins text-left"
                  }`}
                >
                  {isRtl ? "✓ " : "✓ "}
                  {t("subscribeSuccess")}
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
