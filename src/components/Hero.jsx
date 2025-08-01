import { Button } from "./ui/button";
import TokenPriceDashboard from "./module/TokenPriceDashboard";

import CustomConnectButton from "./module/CustomConnectButton";

export const Hero = () => {
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
      <div className="flex flex-col items-center lg:items-start lg:px-20 lg:py-10 gap-4 lg:gap-8 font-poppins">
        <img src="/hero/logo.png" alt="hero-logo" className="hidden lg:block" />
        <h1 className="text-[24px] lg:text-[50px] font-bold text-center lg:text-left px-10 lg:px-0">
          Real-World Mining Meets Web3
        </h1>
        <span className="text-center lg:text-left px-6 lg:px-0 lg:text-[30px]">
          Invest in real, verified mineral assets through blockchain.
        </span>
        <div className="flex items-center gap-4 lg:gap-12 mt-5">
          <CustomConnectButton
            className={
              "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] w-1/2 px-8 lg:py-8 lg:text-[30px] cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 ease-in-out rounded-[16px]"
            }
          />

          <Button className="bg-transparent border border-secondary border-2 text-secondary w-1/2 px-8 lg:text-[30px] lg:px-20 lg:py-8 cursor-pointer hover:bg-secondary hover:text-white hover:scale-105 hover:shadow-lg transition-all duration-300 rounded-[16px]">
            <a href="#roadmap">Roadmap</a>
          </Button>
        </div>
      </div>
      <div className="relative">
        <TokenPriceDashboard />
      </div>
    </section>
  );
};
