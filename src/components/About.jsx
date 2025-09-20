import { useTranslations, useLocale } from "next-intl";
import { Globe, Eye, DollarSign, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

const About = () => {
  const t = useTranslations("about");
  const locale = useLocale();
  const isRTL = locale === "fa";

  const cardData = [
    {
      title: t("globalAccess.title"),
      description: t("globalAccess.description"),
      icon: Globe,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: t("fullTransparency.title"),
      description: t("fullTransparency.description"),
      icon: Eye,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: t("realSupport.title"),
      description: t("realSupport.description"),
      icon: DollarSign,
      color: "from-[#FF5D1B] to-[#FF363E]",
      bgColor: "bg-orange-50"
    },
  ];

  return (
    <section
      id="about"
      className="relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-l from-[#FF5D1B]/5 to-[#FF363E]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-[clamp(16px,2.5vw,20px)] text-gray-600 max-w-6xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {cardData.map((card, index) => {
            const IconComponent = card.icon;

            return (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-gray-100 overflow-hidden"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                {/* Floating Elements */}
                <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative text-center">
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${card.color} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#FF5D1B] transition-colors duration-300">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {card.description}
                  </p>

                  {/* Check Icon */}
                  <div className="flex justify-center mt-6">
                    <CheckCircle className="w-6 h-6 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default About;
