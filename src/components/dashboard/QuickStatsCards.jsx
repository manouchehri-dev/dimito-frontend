import { useTranslations } from "next-intl";

export default function QuickStatsCards({ overview }) {
  const t = useTranslations("dashboard");

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const stats = [
    {
      id: "totalSpent",
      title: t("stats.totalSpent"),
      value: formatCurrency(overview?.total_spent),
      icon: "💰",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      id: "tokensHeld",
      title: t("stats.tokensHeld"),
      value: `${overview?.tokens_held || 0} ${t("types")}`,
      icon: "🪙",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      iconBg: "bg-yellow-100",
    },
    {
      id: "presales",
      title: t("stats.presalesParticipated"),
      value: `${overview?.total_presales_participated || 0} ${t(
        "participated"
      )}`,
      icon: "📋",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      iconBg: "bg-purple-100",
    },
    {
      id: "verified",
      title: t("stats.verificationRate"),
      value: `${overview?.verified_purchases || 0}/${
        overview?.total_purchases || 0
      } (${overview?.verification_rate?.toFixed(1) || 0}%)`,
      icon: "✅",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      iconBg: "bg-green-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className={`${stat.bgColor} rounded-[16px] p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200`}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className={`w-12 h-12 ${stat.iconBg} rounded-full flex items-center justify-center text-xl`}
            >
              {stat.icon}
            </div>
            <div className={`text-2xl font-bold ${stat.textColor}`}>
              {stat.value}
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-700">{stat.title}</h3>
        </div>
      ))}
    </div>
  );
}
