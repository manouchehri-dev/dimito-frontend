"use client";

import { useTranslations } from "next-intl";
import { Button } from "./ui/button";
import TokenPriceDashboard from "./module/TokenPriceDashboard";
import CustomConnectButton from "./module/CustomConnectButton";
import { useAccount } from "wagmi";
import { useRouter } from "@/i18n/navigation";

const Hero = () => {
  const t = useTranslations("Hero");
  const { isConnected } = useAccount();
  const router = useRouter();

  const handleMainButtonClick = (e) => {
    e.preventDefault();
    if (isConnected) {
      router.push("/dashboard");
    } else {
      // This will trigger the connect modal via CustomConnectButton
      document.querySelector(".hero-connect-button")?.click();
    }
  };

  return (
    <>
      {/* Full-width Modern Gradient Background */}
      <div className="fixed inset-0 -z-20">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-100"></div>

        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#FF5D1B]/20 to-[#FF363E]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-[#FF363E]/15 to-[#FF5D1B]/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-orange-200/30 to-red-200/30 rounded-full blur-2xl animate-pulse delay-500"></div>

        {/* Geometric patterns */}
        <div className="absolute top-32 right-20 w-4 h-4 bg-[#FF5D1B]/40 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-40 left-32 w-6 h-6 bg-[#FF363E]/40 rounded-full animate-bounce delay-700"></div>
        <div className="absolute top-1/3 left-20 w-3 h-3 bg-orange-400/50 rounded-full animate-bounce delay-1000"></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #FF5D1B 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <section className="relative grid grid-cols-1 lg:grid-cols-2 pt-[100px] lg:pt-[140px] min-h-screen">

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
              onClick={handleMainButtonClick}
              className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] w-full sm:flex-1 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 ease-in-out rounded-xl lg:rounded-2xl font-medium text-white"
            >
              {isConnected ? t("dashboard") : t("connect_wallet")}
            </Button>

            {/* Hidden CustomConnectButton for wallet connection */}
            <div className="hidden">
              <CustomConnectButton className="hero-connect-button" />
            </div>

            <Button className="bg-transparent border border-secondary border-2 text-secondary w-full sm:flex-1 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg cursor-pointer hover:bg-secondary hover:text-white hover:scale-105 hover:shadow-lg transition-all duration-300 rounded-xl lg:rounded-2xl font-medium">
              <a href="#roadmap" className="block w-full">
                {t("roadmap")}
              </a>
            </Button>
          </div>
        </div>

        <div className="relative">
          {/* <TokenPriceDashboard /> */}
          <img
            src="/hero/blockchain_mining.png"
            alt="blockchain_mining"
            className="w-full h-full object-cover"
          />
        </div>
      </section>
    </>
  );
};

export default Hero;
