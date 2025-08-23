import { useTranslations } from "next-intl";
import { Button } from "./ui/button";
import TokenPriceDashboard from "./module/TokenPriceDashboard";
import CustomConnectButton from "./module/CustomConnectButton";

const Hero = () => {
  const t = useTranslations("Hero");

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 pt-[100px] lg:pt-[140px]">
      {/* Background image - left */}
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

      {/* Background image - right */}
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

      <div className="flex flex-col items-center lg:items-start lg:px-20 lg:py-10 gap-3 sm:gap-4 lg:gap-8 font-poppins px-4 sm:px-6 py-6 sm:py-8">
        <img
          src="/hero/logo.png"
          alt="hero-logo"
          className="hidden lg:block w-auto h-16 sm:h-20 lg:h-24 xl:h-28 object-contain"
        />

        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold text-center lg:text-start px-6 sm:px-8 md:px-10 lg:px-0 leading-tight">
          {t("title")}
        </h1>

        <span className="text-sm sm:text-base md:text-lg lg:text-xl  text-center lg:text-start px-4 sm:px-6 lg:px-0 leading-relaxed">
          {t("description")}
        </span>

        <div className="flex items-center gap-3 sm:gap-4 lg:gap-12 mt-3 sm:mt-4 lg:mt-5 w-full max-w-sm sm:max-w-md lg:max-w-none">
          <CustomConnectButton
            className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] w-1/2 px-2 sm:px-3 md:px-4 lg:px-8 py-2 sm:py-3 lg:py-8 text-xs sm:text-sm md:text-base lg:text-xl  cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 ease-in-out rounded-2xl font-medium whitespace-nowrap overflow-hidden text-ellipsis"
            label={t("connect_wallet")}
          />

          <Button className="bg-transparent border border-secondary border-2 text-secondary w-1/2 px-2 sm:px-3 md:px-4 lg:px-8 xl:px-20 py-2 sm:py-3 lg:py-8 text-xs sm:text-sm md:text-base lg:text-xl cursor-pointer hover:bg-secondary hover:text-white hover:scale-105 hover:shadow-lg transition-all duration-300 rounded-2xl font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            <a href="#roadmap" className="block w-full truncate">
              {t("roadmap")}
            </a>
          </Button>
        </div>
      </div>

      <div className="relative">
        <TokenPriceDashboard />
      </div>
    </section>
  );
};

export default Hero;
