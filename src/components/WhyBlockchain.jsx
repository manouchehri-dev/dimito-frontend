import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Image from "next/image";
const WhyBlockchain = () => {
  const locale = useLocale();
  const isRTL = locale === "fa";
  const t = useTranslations("whyBlockchain");
  const benefits = [
    t("benefits.transparency"),
    t("benefits.smartContracts"),
    t("benefits.resistance"),
    t("benefits.globalAccess"),
  ];

  return (
    <section
      id="why-blockchain"
      className="pt-12 lg:my-20 lg:mb-30"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="lg:pl-10">
          {/* Header */}
          <div className="mb-2 flex flex-col items-center justify-center lg:items-start">
            <h1 className="font-poppins text-center text-[clamp(14px,2.5vw,24px)] font-bold [text-wrap:balance]">
              {t("title")}
            </h1>
          </div>

          {/* Benefits List with Connected Design */}
          <div
            className={`relative max-w-2xl mx-auto lg:mx-0  border-[#FF5D1B] border-t-4 rounded-t-xl py-10 ${
              isRTL ? "rounded-l-none border-r-4" : "rounded-r-none border-l-4"
            }`}
          >
            {/* Benefits */}
            <div className="space-y-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="relative flex items-center">
                  {/* Horizontal connector line */}

                  {isRTL ? (
                    <>
                      {/* Arrow/connector dot */}
                      <div className="absolute right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md transform translate-x-1/2"></div>

                      {/* Arrow shape */}
                      <div className="absolute right-10 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[8px] border-t-transparent border-b-transparent border-r-red-500"></div>
                      <div className="absolute right-0 w-12 h-0.5 bg-gradient-to-r from-red-500 to-orange-500"></div>
                    </>
                  ) : (
                    <>
                      <div className="absolute left-0 w-12 h-0.5 bg-gradient-to-r from-red-500 to-orange-500"></div>

                      {/* Arrow/connector dot */}
                      <div className="absolute left-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md transform -translate-x-1/2"></div>

                      {/* Arrow shape */}
                      <div className="absolute left-12 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[8px] border-t-transparent border-b-transparent border-l-red-500"></div>
                    </>
                  )}

                  {/* Benefit text */}
                  <div
                    className={`${
                      isRTL ? "mr-16" : "ml-16"
                    } bg-white w-full px-1 py-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200`}
                  >
                    <p className="text-[clamp(14px,2.2vw,20px)] leading-relaxed">
                      {benefit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[684px] overflow-hidden rounded-3xl">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src="/images/blockchain.webp"
              alt="blockchain"
              fill
              className="object-cover"
              sizes="(min-width:1024px) 684px, (min-width:640px) 80vw, 90vw"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyBlockchain;
