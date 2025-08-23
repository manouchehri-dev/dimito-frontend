import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocale, useTranslations } from "next-intl";
import { title } from "process";
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
    <section id="tokenomics" className="py-10">
      <div className="flex flex-col items-center justify-center lg:items-start">
        <h1 className="text-[14px] lg:text-[24px] font-bold border-b-2 lg:border-b-4 border-[#FF5D1B] pb-4 text-center">
          {t("title")}
        </h1>
      </div>
      <div className="my-10 lg:my-30 flex flex-col lg:flex-wrap lg:flex-row lg:justify-center lg:gap-12">
        {Data.map((data, index) => (
          <Card
            className="text-center my-5 h-fit lg:w-[453px] lg:min-h-[310px]"
            key={index}
          >
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] text-start lg:text-[24px] font-bold">
                  {data.title}
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[12px] lg:text-[18px] font-400 text-start ">
                {data.description}
              </div>
            </CardContent>
            <CardFooter>
              {data.footer && (
                <div className="text-[12px] font-400 text-start lg:text-[18px]">
                  {data.footer}
                </div>
              )}
              {data.features && (
                <div className="text-start text-[12px] lg:text-[18px]">
                  <span>{data.features.title}</span>
                  <ul className="list-disc my-2">
                    {data.features.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}

        <Card className="text-center my-5 h-fit lg:w-[434px] lg:h-[277px]">
          <CardHeader className="pl-0">
            <CardTitle>
              <p className="text-[14px] text-start lg:text-[24px] font-bold">
                تخصیص توکن (Token Allocation)
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-start space-y-1">
              <p className="text-[14px] text-start lg:text-[18px] font-bold">
                ۹۰٪ برای توسعه پروژه
              </p>
              <p className="text-[12px] font-400">
                شامل استخراج، زیرساخت، بازاریابی و پرداخت به شرکا
              </p>
            </div>
            <div className="text-start space-y-1">
              <p className="text-[14px] text-start lg:text-[18px] font-bold">
                ۱۰٪ نقدینگی (Liquidity)
              </p>
              <p className="text-[12px] font-400">
                برای صرافی‌های داخلی و بازار ثانویه، تضمین نقدشوندگی توکن
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="text-center my-5 h-fit lg:w-[434px] lg:h-[277px]">
          <CardHeader className="pl-0">
            <CardTitle>
              <p className="text-[14px] text-start lg:text-[24px] font-bold">
                شفافیت و دسترسی به قرارداد هوشمند
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-col text-start space-y-5 text-[14px]">
              <Button
                className={
                  "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] w-full px-8 lg:py-8 lg:text-[20px] cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 ease-in-out rounded-1/2"
                }
              >
                <a href="#roadmap">اکسپلورر قرارداد هوشمند</a>
              </Button>
              <Button className="bg-transparent border border-secondary border-2 text-secondary w-full px-8 lg:text-[20px] lg:px-20 lg:py-8 cursor-pointer hover:bg-secondary hover:text-white hover:scale-105 hover:shadow-lg transition-all duration-300 rounded-1/2">
                <a href="#roadmap">وایت پیپر</a>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="text-center lg:py-12 my-5 h-fit lg:w-[434px] lg:h-[277px]">
          <CardHeader>
            <CardTitle>
              <p className="text-[14px] text-start lg:text-[24px] font-bold">
                توضیحات تکمیلی برای کاربر
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[12px] lg:text-[18px] font-400 text-start">
              هر کس می‌تواند قبل از خرید، بررسی قرارداد هوشمند و تاریخچه
              تراکنش‌ها را انجام دهد.
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Tokenomics;
