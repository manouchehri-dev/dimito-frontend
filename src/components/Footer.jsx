"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { useState, useEffect } from "react";
import { httpClient } from "@/lib/auth/httpClient";
import toast from "react-hot-toast";

const Footer = () => {
  const t = useTranslations("footer");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [submitCount, setSubmitCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

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

  // Reset submission count and blocked state after 10 minutes
  useEffect(() => {
    if (submitCount > 0 || isBlocked) {
      const resetTimer = setTimeout(() => {
        setSubmitCount(0);
        setIsBlocked(false);
        setEmailError("");
      }, 10 * 60 * 1000); // 10 minutes

      return () => clearTimeout(resetTimer);
    }
  }, [submitCount, isBlocked]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");

    // 1. Rate Limiting - Prevent rapid submissions
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime;
    const MIN_SUBMIT_INTERVAL = 3000; // 3 seconds between submissions

    if (timeSinceLastSubmit < MIN_SUBMIT_INTERVAL) {
      const remainingTime = Math.ceil((MIN_SUBMIT_INTERVAL - timeSinceLastSubmit) / 1000);
      setEmailError(
        isRtl 
          ? `لطفاً ${remainingTime} ثانیه صبر کنید`
          : `Please wait ${remainingTime} seconds before submitting again`
      );
      return;
    }

    // 2. Submission Count Limiting - Max 3 attempts per session
    if (submitCount >= 3) {
      setIsBlocked(true);
      setEmailError(
        isRtl
          ? "حد مجاز تلاش‌ها به پایان رسیده. لطفاً صفحه را رفرش کنید"
          : "Maximum attempts reached. Please refresh the page"
      );
      return;
    }

    // 3. Basic validation
    if (!email.trim()) {
      setEmailError(t("emailRequired"));
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(t("emailInvalid"));
      return;
    }

    // 4. Honeypot check (if honeypot field exists and has value, it's likely a bot)
    const honeypot = document.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      // Silently fail for bots
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setEmailError(
          isRtl
            ? "خطا در ارسال. لطفاً دوباره تلاش کنید"
            : "Submission error. Please try again"
        );
      }, 2000);
      return;
    }

    // Update rate limiting counters
    setLastSubmitTime(now);
    setSubmitCount(prev => prev + 1);
    setIsLoading(true);

    try {
      const response = await httpClient.post("/newsletter/subscribe/", {
        contact: email.trim()
      });

      console.log(response)
      // httpClient returns response.data directly, so response should contain the API response
      if (response.data.success == true) {
        setIsSubscribed(true);
        setEmail("");
        console.log("here")

        // Show success toast
        toast.success(
          isRtl
            ? "✅ با موفقیت در خبرنامه عضو شدید!"
            : "✅ Successfully subscribed to newsletter!",
          {
            duration: 4000,
            position: "top-center",
            style: {
              background: "#10B981",
              color: "#fff",
              fontWeight: "600",
              borderRadius: "12px",
              padding: "16px",
            },
          }
        );
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);

      // Handle validation errors from API
      // The httpClient transforms errors, so check both patterns
      if (error.status === 400 && error.data?.contact) {
        const errorMessage = Array.isArray(error.data.contact)
          ? error.data.contact[0]
          : error.data.contact;

        setEmailError(errorMessage);

        // Show error toast
        toast.error(
          isRtl
            ? "❌ لطفاً یک آدرس ایمیل معتبر وارد کنید"
            : "❌ Please enter a valid email address",
          {
            duration: 4000,
            position: "top-center",
            style: {
              background: "#EF4444",
              color: "#fff",
              fontWeight: "600",
              borderRadius: "12px",
              padding: "16px",
            },
          }
        );
      } else if (error.response?.status === 400 && error.response?.data?.contact) {
        // Fallback for direct axios error structure
        const errorMessage = Array.isArray(error.response.data.contact)
          ? error.response.data.contact[0]
          : error.response.data.contact;

        setEmailError(errorMessage);

        toast.error(
          isRtl
            ? "❌ لطفاً یک آدرس ایمیل معتبر وارد کنید"
            : "❌ Please enter a valid email address",
          {
            duration: 4000,
            position: "top-center",
            style: {
              background: "#EF4444",
              color: "#fff",
              fontWeight: "600",
              borderRadius: "12px",
              padding: "16px",
            },
          }
        );
      } else if (error.response?.status === 409 && error.response?.data?.message) {
        // Fallback for direct axios error structure
        const errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message[0]
          : error.response.data.message;

        setEmailError(errorMessage);

        toast.error(
          isRtl
            ? "❌ این ایمیل قبلاً ثبت شده است"
            : "❌ This email has already been subscribed",
          {
            duration: 4000,
            position: "top-center",
            style: {
              background: "#EF4444",
              color: "#fff",
              fontWeight: "600",
              borderRadius: "12px",
              padding: "16px",
            },
          }
        );
      } else {
        // Handle other errors
        const errorMessage = isRtl
          ? "خطا در عضویت در خبرنامه. لطفاً دوباره تلاش کنید."
          : "Error subscribing to newsletter. Please try again.";

        setEmailError(errorMessage);

        toast.error(
          isRtl
            ? "❌ خطا در عضویت. لطفاً دوباره تلاش کنید"
            : "❌ Subscription failed. Please try again",
          {
            duration: 4000,
            position: "top-center",
            style: {
              background: "#EF4444",
              color: "#fff",
              fontWeight: "600",
              borderRadius: "12px",
              padding: "16px",
            },
          }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer
      dir={isRtl ? "rtl" : "ltr"}
      className="relative z-10 text-primary overflow-hidden"
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

      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12 xl:gap-16">
          {/* Brand Section */}
          <div className="md:col-span-2 lg:col-span-1 flex flex-col items-center lg:items-start gap-3 sm:gap-4 group">
            <Link
              href={``}
              className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 transform transition-all duration-300 group-hover:scale-105"
            >
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="DMT Token"
                  width={63}
                  height={63}
                  className="w-[28px] sm:w-[36px] md:w-[40px] lg:w-[54px] h-auto transition-transform duration-300 group-hover:rotate-6"
                />
                <div className="absolute inset-0 bg-orange-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
              <h1
                id="footer-heading"
                className={`text-[clamp(16px,5vw,28px)] font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent text-center sm:text-left ${isRtl ? "font-iransans" : "font-poppins"
                  }`}
              >
                DMT Token
              </h1>
            </Link>

            <div className="text-center lg:text-start max-w-xs sm:max-w-sm mx-auto lg:mx-0 px-2 sm:px-0">
              <p
                className={`font-bold text-[clamp(13px,3.5vw,18px)] [text-wrap:balance] text-gray-800 mb-1.5 sm:mb-2 ${isRtl ? "font-iransans" : "font-poppins"
                  }`}
              >
                {t("subtitle")}
              </p>
              <p
                className={`text-[clamp(12px,3vw,14px)] text-gray-600 leading-relaxed ${isRtl ? "font-iransans" : "font-poppins"
                  }`}
              >
                {t("description")}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col items-center md:items-start gap-2 sm:gap-3">
            <h3
              className={`font-bold text-[clamp(14px,3.5vw,18px)] text-gray-800 ${isRtl ? "font-iransans" : "font-poppins"
                }`}
            >
              {isRtl ? "پیوندها" : "Navigation"}
            </h3>
            <nav className="flex flex-col gap-1 sm:gap-1.5 text-center md:text-start md:text-left">
              <Link
                href={``}
                className={`text-[clamp(12px,3vw,14px)] text-gray-600 hover:text-orange-500 transition-all duration-200 transform ${isRtl
                  ? "hover:-translate-x-1 font-iransans"
                  : "hover:translate-x-1 font-poppins"
                  }`}
              >
                {t("navigation.home")}
              </Link>
              <Link
                href="/tokenomics"
                className={`text-[clamp(12px,3vw,14px)] text-gray-600 hover:text-orange-500 transition-all duration-200 transform ${isRtl
                  ? "hover:-translate-x-1 font-iransans"
                  : "hover:translate-x-1 font-poppins"
                  }`}
              >
                {t("navigation.tokenomics")}
              </Link>
              <Link
                href="/whitepaper"
                className={`text-[clamp(12px,3vw,14px)] text-gray-600 hover:text-orange-500 transition-all duration-200 transform ${isRtl
                  ? "hover:-translate-x-1 font-iransans"
                  : "hover:translate-x-1 font-poppins"
                  }`}
              >
                {t("navigation.whitepaper")}
              </Link>
              <Link
                href={`/transparency`}
                className={`text-[clamp(12px,3vw,14px)] text-gray-600 hover:text-orange-500 transition-all duration-200 transform ${isRtl
                  ? "hover:-translate-x-1 font-iransans"
                  : "hover:translate-x-1 font-poppins"
                  }`}
              >
                {t("navigation.transparency")}
              </Link>
              <Link
                href={`/dashboard`}
                className={`text-[clamp(12px,3vw,14px)] text-gray-600 hover:text-orange-500 transition-all duration-200 transform ${isRtl
                  ? "hover:-translate-x-1 font-iransans"
                  : "hover:translate-x-1 font-poppins"
                  }`}
              >
                {t("navigation.dashboard")}
              </Link>
              <Link
                href={`/login?redirect=transparency`}
                className={`text-[clamp(12px,3vw,14px)] text-gray-600 hover:text-orange-500 transition-all duration-200 transform ${isRtl
                  ? "hover:-translate-x-1 font-iransans"
                  : "hover:translate-x-1 font-poppins"
                  }`}
              >
                {t("navigation.transparencyLogin")}
              </Link>
            </nav>
          </div>

          {/* Social & Legal Links */}
          <div className="flex flex-col items-center md:items-start gap-2 sm:gap-3">
            <h3
              className={`font-bold text-[clamp(14px,3.5vw,18px)] text-gray-800 ${isRtl ? "font-iransans" : "font-poppins"
                }`}
            >
              {t("social.title")}
            </h3>
            <div className="flex flex-col gap-1 sm:gap-1.5 text-center md:text-left">
              <a
                href="#"
                className={`text-[clamp(12px,3vw,14px)] text-gray-600 hover:text-orange-500 transition-all duration-200 transform ${isRtl
                  ? "hover:-translate-x-1 font-iransans"
                  : "hover:translate-x-1 font-poppins"
                  }`}
              >
                {t("social.telegram")}
              </a>
              <a
                href="#"
                className={`text-[clamp(12px,3vw,14px)] text-gray-600 hover:text-orange-500 transition-all duration-200 transform ${isRtl
                  ? "hover:-translate-x-1 font-iransans"
                  : "hover:translate-x-1 font-poppins"
                  }`}
              >
                {t("social.twitter")}
              </a>
              <a
                href="#"
                className={`text-[clamp(12px,3vw,14px)] text-gray-600 hover:text-orange-500 transition-all duration-200 transform ${isRtl
                  ? "hover:-translate-x-1 font-iransans"
                  : "hover:translate-x-1 font-poppins"
                  }`}
              >
                {t("social.linkedin")}
              </a>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="md:col-span-2 lg:col-span-1 flex w-full flex-col items-center lg:items-start gap-2 sm:gap-3">
            <h3
              className={`font-bold text-[clamp(14px,3.5vw,18px)] text-gray-800 ${isRtl ? "font-iransans" : "font-poppins"
                }`}
            >
              {t("subscribe")}
            </h3>

            <form
              className="w-full max-w-sm sm:max-w-md lg:max-w-none"
              onSubmit={handleSubmit}
              aria-label={t("subscribe")}
            >
              <div className="flex flex-col gap-2 sm:gap-3">
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
                
                {/* Email Input */}
                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    inputMode="email"
                    placeholder={t("email")}
                    className={`
                      w-full rounded-lg bg-white/90 font-medium shadow-sm ring-1 transition-all duration-300
                      py-2 sm:py-2.5 px-2.5 sm:px-3 text-[clamp(12px,3vw,14px)]
                      placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white focus:shadow-md
                      hover:shadow-md hover:ring-orange-300/50
                      ${isRtl
                        ? "font-iransans text-right"
                        : "font-poppins text-left"
                      }
                    `}
                    dir={isRtl ? "rtl" : "ltr"}
                    disabled={isLoading || isSubscribed || isBlocked}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isSubscribed || isBlocked}
                  className={`
                    w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-bold text-[clamp(12px,3vw,14px)]
                    transition-all duration-300 transform
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400
                    ${isSubscribed
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
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
