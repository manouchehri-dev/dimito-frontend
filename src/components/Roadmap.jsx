import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Button } from "./ui/button";
const Roadmap = () => {
  const t = useTranslations("roadmap");
  const isRtl = useLocale() === "fa";
  const roadmapItems = [
    {
      id: 1,
      title: t("items.ico"),
      status: "1",
    },
    {
      id: 2,
      title: t("items.contracts"),
      status: "2",
    },
    {
      id: 3,
      title: t("items.market"),
      status: "3",
    },
    {
      id: 4,
      title: t("items.physical"),
      status: "4",
    },
  ];

  return (
    <section
      id="roadmap"
      className="pt-16 lg:py-24 -mx-[28px] lg:-mx-[72px] bg-gradient-to-b from-[#F5F5F5] to-[#FFEDE4] relative"
    >
      {/* Vertical Timeline Line */}
      <div className="hidden lg:block absolute left-1/2 transform -translate-x-0.5 top-0 bottom-0 w-px border-[2px] border-dashed border-[#FFC7AF]"></div>

      <div className="mx-auto mx-[28px] lg:mx-[72px] ">
        {/* Header */}
        <div className="text-center lg:text-start mb-6 lg:mb-0">
          <div className="inline-block">
            <h2 className="text-[14px] lg:text-2xl font-bold text-primary mb-2">
              {t("title")}
            </h2>
            <div className="w-32 h-0.5 bg-orange-500"></div>
            {/* <div className="hidden lg:flex mt-5">
              <Button
                className={
                  "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] px-18 lg:py-8 lg:text-[20px] cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 ease-in-out rounded-[16px]"
                }
              >
                <a href="#roadmap">خرید توکن</a>
              </Button>
            </div> */}
            {/* Adjust w-32 to desired length */}
          </div>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative max-w-5xl mx-auto mt-5">
          <div className="space-y-20">
            {roadmapItems.map((item, index) => (
              <div
                key={item.id}
                className={`relative flex items-start justify-center gap-5 ${
                  isRtl
                    ? index % 2 == 0
                      ? "flex-row-reverse pr-100"
                      : "flex-row pl-100"
                    : index % 2 == 0
                    ? "flex-row pr-100"
                    : "flex-row-reverse pl-100"
                }`}
              >
                {/* Content */}
                <div>
                  <div
                    className={`bg-white p-6 w-96 border-3 rounded-2xl border-[#FFC4AE] ${
                      index % 2 == 0
                        ? "rounded-l-2xl rounded-t-none"
                        : "rounded-r-2xl rounded-t-none"
                    }`}
                  >
                    <p className="text-base font-normal text-gray-800 text-center leading-relaxed">
                      {item.title}
                    </p>
                  </div>
                </div>
                {/* Timeline Circle */}
                <div className="w-12 h-12 bg-white border-2 border-[#FFC2AD] rounded-full flex items-center justify-center text-gray-700 text-sm font-medium z-10">
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden relative pt-10 pb-10">
          {/* Vertical Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-0.5 top-0 bottom-0 w-px border-l-2 border-dashed border-[#FFC7AF]"></div>
          <div>
            <div className="space-y-12">
              {roadmapItems.map((item) => (
                <div
                  key={item.id}
                  className="relative flex flex-col items-center"
                >
                  {/* Timeline Circle */}
                  <div className="mb-2 w-8 h-8 bg-[#FFF7F3] border-2 border-[#FFC2AD] rounded-full flex items-center justify-center text-primary text-[14px] font-[700] z-10">
                    {item.status}
                  </div>

                  {/* Content */}
                  <div className="w-3/4">
                    <div className="bg-white border-2 border-[#FFC4AE] rounded-xl p-4">
                      <p className="text-[14px] font-bold text-primary text-center">
                        {item.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
