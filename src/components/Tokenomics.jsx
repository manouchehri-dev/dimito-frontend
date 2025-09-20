import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Network,
  Coins,
  PieChart,
  TrendingUp,
  BarChart3,
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

const Tokenomics = () => {
  const t = useTranslations("tokenomics");
  const locale = useLocale();
  const isRTL = locale === "fa";

  const tokenomicsData = [
    {
      id: "network",
      icon: Network,
      title: t("cards.network.title"),
      description: t("cards.network.description"),
      features: [
        t("cards.network.features.items.0"),
        t("cards.network.features.items.1"),
        t("cards.network.features.items.2"),
      ],
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      highlight: "BSC Network"
    },
    {
      id: "supply",
      icon: Coins,
      title: t("cards.supply.title"),
      description: t("cards.supply.description"),
      features: [
        t("cards.supply.features.items.0"),
        t("cards.supply.features.items.1"),
        t("cards.supply.features.items.2"),
      ],
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      highlight: "1B Tokens"
    },
    {
      id: "allocation",
      icon: PieChart,
      title: t("cards.allocation.title"),
      description: t("cards.allocation.description"),
      features: [
        t("cards.allocation.features.items.0"),
        t("cards.allocation.features.items.1"),
        t("cards.allocation.features.items.2"),
      ],
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      highlight: "No Reserve"
    },
    {
      id: "profitability",
      icon: TrendingUp,
      title: t("cards.profitability.title"),
      description: t("cards.profitability.description"),
      features: [
        t("cards.profitability.features.items.0"),
        t("cards.profitability.features.items.1"),
        t("cards.profitability.features.items.2"),
      ],
      color: "from-[#FF5D1B] to-[#FF363E]",
      bgColor: "bg-orange-50",
      highlight: "Profit Sharing"
    },
    {
      id: "markets",
      icon: BarChart3,
      title: t("cards.markets.title"),
      description: t("cards.markets.description"),
      features: [
        t("cards.markets.features.items.0"),
        t("cards.markets.features.items.1"),
        t("cards.markets.features.items.2"),
      ],
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      highlight: "Dual Markets"
    },
    {
      id: "transparency",
      icon: Shield,
      title: t("cards.transparency.title"),
      description: t("cards.transparency.description"),
      features: [
        t("cards.transparency.features.items.0"),
        t("cards.transparency.features.items.1"),
        t("cards.transparency.features.items.2"),
      ],
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      highlight: "Full Transparency"
    },
  ];

  return (
    <section
      id="tokenomics"
      className="relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-l from-[#FF5D1B]/5 to-[#FF363E]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-[clamp(16px,2.5vw,20px)] text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {isRTL
              ? "مدل اقتصادی جامع DiMiTo که شفافیت، سودآوری و پایداری را تضمین می‌کند."
              : "Comprehensive economic model of DiMiTo ensuring transparency, profitability, and sustainability."
            }
          </p>
        </div>

        {/* Tokenomics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tokenomicsData.map((item, index) => {
            const IconComponent = item.icon;

            return (
              <div
                key={item.id}
                className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-gray-100 overflow-hidden"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                {/* Floating Elements */}
                <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    {/* Highlight Badge */}
                    <div className={`${item.bgColor} px-3 py-1 rounded-full`}>
                      <span className="text-xs font-semibold text-gray-700">
                        {item.highlight}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#FF5D1B] transition-colors duration-300">
                    {item.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                    {item.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-3">
                    {item.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <span className="text-sm text-gray-600 leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>


                </div>
              </div>
            );
          })}
        </div>

        {/* Key Statistics */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: isRTL ? "کل عرضه" : "Total Supply", value: "1B", subtext: isRTL ? "توکن" : "Tokens" },
            { label: isRTL ? "شبکه" : "Network", value: "BSC", subtext: isRTL ? "بلاکچین" : "Blockchain" },
            { label: isRTL ? "توزیع سود" : "Profit Share", value: "100%", subtext: isRTL ? "شفاف" : "Transparent" },
            { label: isRTL ? "نقدینگی" : "Liquidity", value: "10%", subtext: isRTL ? "اولیه" : "Initial" },
          ].map((stat, index) => (
            <div key={index} className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-3xl font-bold text-[#FF5D1B] mb-2">{stat.value}</div>
              <div className="text-gray-900 font-semibold mb-1">{stat.label}</div>
              <div className="text-gray-500 text-sm">{stat.subtext}</div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-16">
          <Link
            href="/tokenomics"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white rounded-2xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 font-semibold text-lg"
          >
            <span>
              {isRTL ? "مطالعه کامل توکنومیکس" : "Complete Tokenomics Details"}
            </span>
            {isRTL ? (
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            ) : (
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            )}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Tokenomics;
