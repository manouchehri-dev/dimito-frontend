import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Image from "next/image";
import { Shield, Globe, Zap, Eye, CheckCircle } from "lucide-react";

const WhyBlockchain = () => {
  const locale = useLocale();
  const isRTL = locale === "fa";
  const t = useTranslations("whyBlockchain");

  const benefits = [
    {
      icon: Eye,
      title: t("benefits.transparency"),
      description: t("benefits.transparencyDesc")
    },
    {
      icon: Shield,
      title: t("benefits.resistance"),
      description: t("benefits.resistanceDesc")
    },
    {
      icon: Globe,
      title: t("benefits.globalAccess"),
      description: t("benefits.globalAccessDesc")
    },
  ];

  return (
    <section
      id="why-blockchain"
      className="py-14 relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#FF5D1B]/10 to-[#FF363E]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-[#FF363E]/8 to-[#FF5D1B]/8 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-[clamp(24px,4vw,48px)] font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Benefits Cards */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-gray-100 hover:border-[#FF5D1B]/30"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#FF5D1B] transition-colors duration-300">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>

                    {/* Check Icon */}
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Image Section */}
          <div className="relative">
            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-r from-[#FF5D1B]/20 to-[#FF363E]/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-r from-[#FF363E]/20 to-[#FF5D1B]/20 rounded-full blur-xl"></div>

            {/* Main Image */}
            <div className="relative bg-white rounded-3xl p-4 shadow-2xl">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                <Image
                  src="/images/blockchain.webp"
                  alt="blockchain technology"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(min-width:1024px) 50vw, 90vw"
                  priority
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                {/* Floating Badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {isRTL ? "فناوری بلاکچین" : "Blockchain Tech"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyBlockchain;
