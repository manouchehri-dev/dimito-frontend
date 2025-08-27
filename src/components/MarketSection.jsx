"use client";

import { Button } from "./ui/button";
import { useTranslations } from "next-intl";

const MarketSection = () => {
  const t = useTranslations("market");

  return (
    <section id="market" className="px-2">
      <div className="flex flex-col items-center justify-center lg:items-start">
        <h1 className="text-[14px] lg:text-[24px] font-bold border-b-2 lg:border-b-4 border-[#FF5D1B] pb-4 text-center">
          {t("title")}
        </h1>
        <p
          className={`text-start
          text-[12px] lg:text-[18px] font-normal mt-3 lg:mt-6 leading-[170%]`}
        >
          {t("description")}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 my-5 space-y-2">
        <div className="text-[12px] lg:text-[18px]">
          <span>{t("features.title")}</span>
          <ul className="list-disc mr-2 my-2 space-y-1">
            <li>{t("features.fastSecureTrading")}</li>
            <li>{t("features.stableLiquidity")}</li>
            <li>{t("features.accessExchanges")}</li>
          </ul>
        </div>
        {/* <div className="flex justify-end items-end">
          <Button
            className={
              "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] w-full md:w-1/2 py-6 lg:py-8 lg:text-[20px] cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 ease-in-out rounded-[16px]"
            }
          >
            <a href="#roadmap">{t("enterMarket")}</a>
          </Button>
        </div> */}
      </div>
    </section>
  );
};

export default MarketSection;
