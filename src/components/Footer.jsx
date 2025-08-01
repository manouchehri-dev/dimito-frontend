import { useTranslations, useLocale } from "next-intl";

const Footer = () => {
  const t = useTranslations("footer");
  const isRtl = useLocale() === "fa";
  return (
    <footer className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-20 justify-center text-primary relative py-14 lg:py-20 px-10 lg:px-[190px] z-50">
      {/* Background image - left */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <img
          src="/footer/left.png"
          alt="footer-bg"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Background image - right */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <img
          src="/footer/right.png"
          alt="footer-bg"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col items-center lg:items-start gap-3">
        <div className="flex items-center gap-2 relative">
          <img src="/logo.png" alt="logo" className="w-[29px] lg:w-[63px]" />
          <h1 className="text-[14px] lg:text-[30px]">IMD Token</h1>
        </div>
        <div className="relative">
          <p className="text-center lg:text-start text-[14px] lg:text-[24px] font-bold mx-5 lg:mx-0">
            {t("subtitle")}
          </p>
        </div>
        <div className="relative">
          <p className="text-center lg:text-start text-[12px] lg:text-[18px]">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center lg:items-start justify-center relative gap-2">
        <p className="text-center text-[14px] lg:text-[24px] font-bold">
          {t("subscribe")}
        </p>
        <input
          type="text"
          placeholder={t("email")}
          className={`placeholder:text-start bg-white text-[14px] lg:text-[18px] font-bold py-[14.5px] rounded-xl lg:w-full ${
            isRtl ? "pl-[80px] pr-[20px]" : "pr-[80px] pl-[20px]"
          }`}
        />
        <button className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white text-[14px] lg:text-[24px] font-bold px-[60px] py-[14.5px] rounded-xl mt-2 lg:w-full">
          {t("button")}
        </button>
      </div>
    </footer>
  );
};

export default Footer;
