import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "./ui/button";

const Tokenomics = () => {
  const t = useTranslations("tokenomics");

  const Data = [
    {
      title: t("data.data_1.title"),
      description: t("data.data_1.description"),
      footer: t("data.data_1.footer"),
    },
    {
      title: t("data.data_2.title"),
      description: t("data.data_2.description"),
      features: {
        title: "مزایا",
        items: [
          "قابلیت معامله در اکثر کیف‌پول‌ها و صرافی‌ها",
          "امنیت و ثبات بالا",
          "پشتیبانی از قرارداد هوشمند",
        ],
      },
    },
    {
      title: "شبکه (Blockchain Network)",
      description: "شبکه انتخابی: BSC – Binance Smart Chain",
      features: {
        title: "مزایا",
        items: [
          "کارمزد پایین",
          "سرعت تراکنش بالا",
          "پشتیبانی گسترده کیف‌پول‌ها",
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

          {/* Token Allocation Card */}
          <Card className="h-min-fit w-full max-w-md mx-auto md:max-w-none transition-all duration-300 hover:shadow-lg flex flex-col overflow-hidden">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6 flex-shrink-0">
              <CardTitle>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-start leading-tight line-clamp-2 break-words">
                  تخصیص توکن (Token Allocation)
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4 flex-grow overflow-hidden">
              <div className="text-start space-y-1 sm:space-y-2">
                <p className="text-sm sm:text-base md:text-lg font-bold line-clamp-1 break-words">
                  ۹۰٪ برای توسعه پروژه
                </p>
                <p className="text-xs sm:text-sm font-normal leading-relaxed line-clamp-2 break-words">
                  شامل استخراج، زیرساخت، بازاریابی و پرداخت به شرکا
                </p>
              </div>
              <div className="text-start space-y-1 sm:space-y-2">
                <p className="text-sm sm:text-base md:text-lg font-bold line-clamp-1 break-words">
                  ۱۰٪ نقدینگی (Liquidity)
                </p>
                <p className="text-xs sm:text-sm font-normal leading-relaxed line-clamp-2 break-words">
                  برای صرافی‌های داخلی و بازار ثانویه، تضمین نقدشوندگی توکن
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Smart Contract Transparency Card */}
          <Card className="h-min-fit w-full max-w-md mx-auto md:max-w-none transition-all duration-300 hover:shadow-lg flex flex-col overflow-hidden">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6 flex-shrink-0">
              <CardTitle>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-start leading-tight line-clamp-2 break-words">
                  شفافیت و دسترسی به قرارداد هوشمند
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 flex-grow flex flex-col justify-center overflow-hidden">
              <div className="flex flex-col text-start space-y-3 sm:space-y-4">
                <Button className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 ease-in-out rounded-2xl font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  <a href="#roadmap" className="block truncate">
                    قرارداد هوشمند
                  </a>
                </Button>
                <Button className="bg-transparent border-2 border-secondary text-secondary w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base cursor-pointer hover:bg-secondary hover:text-white hover:scale-105 hover:shadow-lg transition-all duration-300 rounded-2xl font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  <a href="#roadmap" className="block truncate">
                    وایت پیپر
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="h-min-fit w-full max-w-md mx-auto md:max-w-none transition-all duration-300 hover:shadow-lg flex flex-col overflow-hidden">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6 flex-shrink-0">
              <CardTitle>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-start leading-tight line-clamp-2 break-words">
                  توضیحات تکمیلی برای کاربر
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 flex-grow flex flex-col justify-center overflow-hidden">
              <div className="text-xs sm:text-sm md:text-base font-normal text-start leading-relaxed line-clamp-4 break-words">
                هر کس می‌تواند قبل از خرید، بررسی قرارداد هوشمند و تاریخچه
                تراکنش‌ها را انجام دهد.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Tokenomics;
