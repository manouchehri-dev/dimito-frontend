import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { CheckCircle, Circle, Clock, Code, Rocket, Target, TrendingUp, Zap, Globe } from "lucide-react";

const Roadmap = () => {
  const t = useTranslations("roadmap");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const roadmapItems = [
    {
      id: 1,
      title: t("items.platform"),
      description: t("items.platformDesc"),
      status: "completed",
      icon: Code,
      color: "from-green-500 to-green-600"
    },
    {
      id: 2,
      title: t("items.presales"),
      description: t("items.presalesDesc"),
      status: "completed",
      icon: Rocket,
      color: "from-[#FF5D1B] to-[#FF363E]"
    },
    {
      id: 3,
      title: t("items.market"),
      description: t("items.marketDesc"),
      status: "completed",
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: 4,
      title: t("items.mining"),
      description: t("items.miningDesc"),
      status: "completed",
      icon: Target,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: 5,
      title: t("items.expansion"),
      description: t("items.expansionDesc"),
      status: "upcoming",
      icon: Globe,
      color: "from-purple-500 to-purple-600"
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'current':
        return <Zap className="w-5 h-5 text-[#FF5D1B] animate-pulse" />;
      case 'upcoming':
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { text: isRtl ? 'تکمیل شده' : 'Completed', color: 'bg-green-100 text-green-700 border-green-200' };
      case 'current':
        return { text: isRtl ? 'در حال انجام' : 'In Progress', color: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'upcoming':
        return { text: isRtl ? 'آینده' : 'Upcoming', color: 'bg-gray-100 text-gray-700 border-gray-200' };
      default:
        return { text: isRtl ? 'برنامه‌ریزی شده' : 'Planned', color: 'bg-gray-100 text-gray-500 border-gray-200' };
    }
  };

  return (
    <section
      id="roadmap"
      className="py-14 relative overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-[#FF5D1B]/5 to-[#FF363E]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-l from-[#FF363E]/5 to-[#FF5D1B]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-[clamp(16px,2.5vw,20px)] text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Desktop Timeline */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-0.5 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FF5D1B] via-[#FF363E] to-gray-300 rounded-full"></div>

              <div className="space-y-16">
                {roadmapItems.map((item, index) => {
                  const IconComponent = item.icon;
                  const statusBadge = getStatusBadge(item.status);
                  const isLeft = index % 2 === 0;

                  return (
                    <div key={item.id} className="relative flex items-center justify-center mb-2">
                      {/* Timeline Node */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                        <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-lg border-4 border-white group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className={`w-full flex ${isLeft ? 'justify-start pr-8' : 'justify-end pl-8'}`}>
                        <div className={`w-full max-w-md ${isLeft ? 'mr-8' : 'ml-8'}`}>
                          <div className="group bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-gray-100">
                            <div className="flex items-start justify-between mb-4">
                              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#FF5D1B] transition-colors duration-300">
                                {item.title}
                              </h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                                {getStatusIcon(item.status)}
                                {statusBadge.text}
                              </span>
                            </div>

                            {/* Content */}

                            <p className="text-gray-600 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className="lg:hidden">
            <div className="relative">
              {/* Timeline Line */}
              <div className={`absolute ${isRtl ? "right-6" : "left-6"} top-0 bottom-0 w-1 bg-gradient-to-b from-[#FF5D1B] via-[#FF363E] to-gray-300`}></div>

              <div className="space-y-8">
                {roadmapItems.map((item, index) => {
                  const IconComponent = item.icon;
                  const statusBadge = getStatusBadge(item.status);

                  return (
                    <div key={item.id} className="relative flex items-start gap-6">
                      {/* Timeline Node */}
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-lg border-4 border-white`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">
                              {item.title}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                              {getStatusIcon(item.status)}
                              {statusBadge.text}
                            </span>
                          </div>

                          {/* Content */}

                          <p className="text-gray-600 leading-relaxed text-sm">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Roadmap;
