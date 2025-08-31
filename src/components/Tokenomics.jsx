import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "./ui/button";
import { Link } from "@/i18n/navigation";

const Tokenomics = () => {
  const t = useTranslations("tokenomics");

  const Data = [
    {
      title: t("cards.network.title"),
      description: t("cards.network.description"),
      features: {
        title: t("cards.network.features.title"),
        items: [
          t("cards.network.features.items.0"),
          t("cards.network.features.items.1"),
          t("cards.network.features.items.2"),
        ],
      },
    },
    {
      title: t("cards.supply.title"),
      description: t("cards.supply.description"),
      features: {
        title: t("cards.supply.features.title"),
        items: [
          t("cards.supply.features.items.0"),
          t("cards.supply.features.items.1"),
          t("cards.supply.features.items.2"),
        ],
      },
    },
    {
      title: t("cards.allocation.title"),
      description: t("cards.allocation.description"),
      features: {
        title: t("cards.allocation.features.title"),
        items: [
          t("cards.allocation.features.items.0"),
          t("cards.allocation.features.items.1"),
          t("cards.allocation.features.items.2"),
        ],
      },
    },
    {
      title: t("cards.profitability.title"),
      description: t("cards.profitability.description"),
      features: {
        title: t("cards.profitability.features.title"),
        items: [
          t("cards.profitability.features.items.0"),
          t("cards.profitability.features.items.1"),
          t("cards.profitability.features.items.2"),
        ],
      },
    },
    {
      title: t("cards.markets.title"),
      description: t("cards.markets.description"),
      features: {
        title: t("cards.markets.features.title"),
        items: [
          t("cards.markets.features.items.0"),
          t("cards.markets.features.items.1"),
          t("cards.markets.features.items.2"),
        ],
      },
    },
    {
      title: t("cards.transparency.title"),
      description: t("cards.transparency.description"),
      features: {
        title: t("cards.transparency.features.title"),
        items: [
          t("cards.transparency.features.items.0"),
          t("cards.transparency.features.items.1"),
          t("cards.transparency.features.items.2"),
        ],
      },
    },
  ];

  return (
    <section
      id="tokenomics"
      className="py-6 sm:py-8 md:py-10 lg:py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto">
        {/* Title Section */}
        <div className="flex flex-col items-center justify-center lg:items-start mb-8 lg:mb-12">
          <h1 className="text-[14px] lg:text-[24px] font-bold border-b-2 lg:border-b-4 border-[#FF5D1B] pb-4 text-center">
            {t("title")}
          </h1>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
          {/* Dynamic Cards */}
          {Data.map((data, index) => (
            <Card
              className="h-min-fit w-full max-w-md mx-auto md:max-w-none transition-all duration-300 hover:shadow-lg flex flex-col overflow-hidden"
              key={index}
            >
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-6 flex-shrink-0">
                <CardTitle>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-start leading-tight line-clamp-2 break-words">
                    {data.title}
                  </p>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 flex-grow overflow-hidden space-y-3 sm:space-y-4">
                <div className="text-xs sm:text-sm md:text-base font-normal text-start leading-relaxed line-clamp-3 break-words">
                  {data.description}
                </div>

                {data.footer && (
                  <div className="text-xs sm:text-sm md:text-base font-normal text-start leading-relaxed line-clamp-2 break-words">
                    {data.footer}
                  </div>
                )}

                {data.features && (
                  <div className="text-start text-xs sm:text-sm md:text-base overflow-hidden">
                    <span className="font-semibold block mb-2 text-sm sm:text-base">
                      {data.features.title}
                    </span>
                    <ul className="list-disc list-inside space-y-1 pr-2 sm:pr-4">
                      {data.features.items
                        .slice(0, 3)
                        .map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="leading-snug text-xs sm:text-sm line-clamp-1 break-words"
                          >
                            {item}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Learn More Section */}
        <div className="text-center mt-12">
          <Link
            href="/tokenomics"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white font-semibold rounded-2xl hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
          >
            <span className="text-lg">
              {useLocale() === "fa"
                ? "مطالعه کامل توکنومیکس"
                : "Complete Tokenomics Details"}
            </span>
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Tokenomics;
