import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";

const About = () => {
  const t = useTranslations("about");
  const isRTL = useLocale() === "fa";

  const cardData = [
    {
      title: t("globalAccess.title"),
      description: t("globalAccess.description"),
      icon: "/icons/globe.png",
      bgColor: "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E]",
    },
    {
      title: t("fullTransparency.title"),
      description: t("fullTransparency.description"),
      icon: "/icons/overview.png",
      bgColor: "bg-gradient-to-r from-[#A463FF] to-[#8036FF]",
    },
    {
      title: t("realSupport.title"),
      description: t("realSupport.description"),
      icon: "/icons/sack-dollar.png",
      bgColor: "bg-gradient-to-r from-[#FAD43B] to-[#FFAB36]",
    },
  ];

  return (
    <section id="about" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="mx-auto">
        <div className="flex flex-col items-center justify-center lg:items-start">
          <div className="flex w-full items-end justify-between gap-4">
            <h1 className="border-b-2 border-[#FF5D1B] pb-3 text-center text-[clamp(14px,2.5vw,24px)] font-bold lg:border-b-4 lg:pb-4">
              {t("title")}
            </h1>
          </div>

          <p
            className={[
              "mt-3 lg:mt-6 px-1.5 lg:px-0 text-center lg:text-start leading-[170%] text-[clamp(12px,2.2vw,20px)]",
              isRTL ? "lg:pl-32" : "lg:pr-32",
            ].join(" ")}
          >
            {t("description")}
          </p>

          {/* Mobile CTA */}
          <div className="mt-4 flex w-full justify-center lg:hidden">
            <Button
              className="w-full max-w-sm rounded-2xl bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] py-3 text-base hover:scale-[1.02] hover:shadow-md hover:shadow-orange-500/25"
              asChild
            >
              <Link href="#roadmap">مشاهده وایت پیپر</Link>
            </Button>
          </div>
        </div>

        {/* Responsive Cards */}
        <div className="my-8 lg:my-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {cardData.map((card, index) => (
            <Card
              key={index}
              className="h-full text-center transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex flex-col items-center gap-4">
                  <div
                    className={[
                      "flex items-center justify-center rounded-lg p-2 sm:p-3",
                      card.bgColor,
                    ].join(" ")}
                  >
                    <Image
                      src={card.icon}
                      alt={String(card.title)}
                      width={56}
                      height={56}
                      className="h-[30px] w-[30px] sm:h-[40px] sm:w-[40px] lg:h-[56px] lg:w-[56px]"
                    />
                  </div>
                  <p className="text-center text-[clamp(14px,2vw,22px)] font-bold">
                    {card.title}
                  </p>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[clamp(12px,2vw,18px)] leading-[170%] text-center">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
