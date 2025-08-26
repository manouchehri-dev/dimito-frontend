"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

const Footer = () => {
  const t = useTranslations("footer");
  const isRtl = useLocale() === "fa";

  return (
    <footer
      dir={isRtl ? "rtl" : "ltr"}
      className="relative z-50 text-primary"
      aria-labelledby="footer-heading"
    >
      {/* Backgrounds */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/footer/left.png"
          alt=""
          priority
          fill
          className="object-cover opacity-60 mix-blend-multiply"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/footer/right.png"
          alt=""
          fill
          className="object-cover opacity-60 mix-blend-multiply"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid grid-cols-1 gap-10 lg:gap-16 lg:grid-cols-2 items-start">
        {/* Brand / Copy */}
        <div className="flex flex-col items-center lg:items-start gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="DMT Token"
              width={63}
              height={63}
              className="w-[29px] lg:w-[63px] h-auto"
            />
            <h1
              id="footer-heading"
              className="text-[clamp(14px,2.2vw,30px)] font-semibold tracking-tight"
            >
              DMT Token
            </h1>
          </div>

          <p className="text-center lg:text-start font-bold text-[clamp(14px,2vw,24px)] [text-wrap:balance] px-3 lg:px-0">
            {t("subtitle")}
          </p>

          <p className="text-center lg:text-start text-[clamp(12px,1.8vw,18px)] leading-relaxed px-3 lg:px-0">
            {t("description")}
          </p>
        </div>

        {/* Subscribe */}
        <form
          className="flex w-full flex-col items-center lg:items-start justify-center gap-3"
          onSubmit={(e) => e.preventDefault()}
          aria-label={t("subscribe")}
        >
          <p className="text-center lg:text-start font-bold text-[clamp(14px,2vw,24px)]">
            {t("subscribe")}
          </p>

          <div className="relative w-full max-w-md lg:max-w-none">
            <label htmlFor="email" className="sr-only">
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              placeholder={t("email")}
              className={[
                "w-full rounded-xl bg-white font-bold shadow-sm ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-orange-400",
                "py-[14.5px] pr-5 pl-5 text-[clamp(14px,1.6vw,18px)]",
              ].join(" ")}
              dir="ltr"
            />

            {/* Submit button overlay on md+, stacked on mobile */}
            <div className="mt-3">
              <button
                type="submit"
                className="w-full md:w-auto rounded-xl bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] px-6 py-[12px] text-white font-bold text-[clamp(14px,2vw,18px)] shadow-sm transition-transform hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400"
              >
                {t("button")}
              </button>
            </div>
          </div>

          {/* small print / rights */}
          <p className="mt-2 text-center lg:text-start text-xs text-black/60">
            © {new Date().getFullYear()} DMT Token
          </p>
        </form>
      </div>
    </footer>
  );
};

export default Footer;
