"use client";

import { useTranslations, useLocale } from "next-intl";
import { Button } from "./ui/button";
import { useRouter } from "@/i18n/navigation";
import { FileText, PieChart, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

const Hero = () => {
  const t = useTranslations("Hero");
  const locale = useLocale();
  const isRTL = locale === "fa";
  const router = useRouter();

  const handleWhitepaperClick = () => {
    router.push("/whitepaper");
  };

  const handleTokenomicsClick = () => {
    router.push("/tokenomics");
  };

  const handlePresalesClick = () => {
    router.push("/dashboard/presales");
  };

  return (
    <section
      className="relative grid grid-cols-1 lg:grid-cols-2 pt-[100px] lg:pt-[140px] min-h-screen px-4 sm:px-6 lg:px-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex flex-col items-center lg:items-start lg:px-20 lg:py-10 gap-3 sm:gap-4 lg:gap-8 font-poppins px-4 sm:px-6 py-6 sm:py-8">
        <img
          src="/logo.png"
          alt="hero-logo"
          className="hidden lg:block w-auto h-16 sm:h-20 lg:h-24 xl:h-28 object-contain"
        />

        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold text-center lg:text-start px-6 sm:px-8 md:px-10 lg:px-0 leading-tight">
          {t("title")}
        </h1>

        <span className="text-sm sm:text-base md:text-lg lg:text-xl  text-center lg:text-start px-4 sm:px-6 lg:px-0 leading-relaxed">
          {t("description")}
        </span>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-8 lg:mt-10 w-full max-w-xs sm:max-w-md lg:max-w-lg">
          <Button
            onClick={handleWhitepaperClick}
            className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] w-full sm:flex-1 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 ease-in-out rounded-xl lg:rounded-2xl font-medium text-white flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            {t("whitepaper")}
          </Button>
          <Button
            onClick={handleTokenomicsClick}
            className="bg-transparent border border-secondary border-2 text-secondary w-full sm:flex-1 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg cursor-pointer hover:bg-secondary hover:text-white hover:scale-105 hover:shadow-lg transition-all duration-300 rounded-xl lg:rounded-2xl font-medium flex items-center justify-center gap-2"
          >
            <PieChart className="w-4 h-4 sm:w-5 sm:h-5" />
            {t("tokenomics")}
          </Button>
        </div>
      </div>

      <div className="relative">
        {/* <TokenPriceDashboard /> */}
        <img
          src="/hero/dimito_hero_image.png"
          alt="dimito_hero_image"
          className="w-full h-full object-cover"
        />
      </div>
    </section>

  );
};

export default Hero;
