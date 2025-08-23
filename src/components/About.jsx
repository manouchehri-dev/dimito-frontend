import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";
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
    <section id="about">
      <div className="flex flex-col items-center justify-center lg:items-start">
        <div className="w-full flex justify-between">
          <h1 className="text-[14px] lg:text-[24px] font-bold border-b-2 lg:border-b-4 border-[#FF5D1B] pb-4 text-center">
            {t("title")}
          </h1>
          <div className="flex items-end">
            <Button
              className={
                "hidden lg:flex bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] w-full px-8 lg:py-8 lg:text-[20px] cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 ease-in-out rounded-[16px]"
              }
            >
              <a href="#roadmap">مشاهده وایت پیپر</a>
            </Button>
          </div>
        </div>
        <p
          className={`text-center lg:text-start px-1.5 lg:px-0 ${
            isRTL ? "lg:pl-32" : "lg:pr-32"
          } text-[12px] lg:text-[24px] font-normal mt-3 lg:mt-6 leading-[170%]`}
        >
          {t("description")}
        </p>
      </div>
      <div className="my-10 lg:my-30 flex flex-col lg:flex-row lg:justify-center lg:gap-12">
        {cardData.map((card, index) => (
          <Card
            className="text-center px-8 lg:py-12 my-5 max-h-full h-60 lg:w-[434px] lg:h-[364px]"
            key={index}
          >
            <CardHeader>
              <CardTitle className="flex flex-col items-center space-y-5">
                <div
                  className={`p-3 rounded-[8px] ${card.bgColor} flex items-center justify-center`}
                >
                  <img
                    src={card.icon}
                    alt={card.title}
                    className="w-[30px] h-[30px] lg:w-[54px] lg:h-[54px]"
                  />
                </div>
                <p className="lg:text-[24px] font-bold">{card.title}</p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[12px] lg:text-[24px] font-normal leading-[170%]">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default About;
