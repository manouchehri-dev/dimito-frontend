"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, DollarSign, PieChart } from "lucide-react";

export default function DashboardStats() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isRTL = locale === "fa";

  // Mock stats data - replace with real data
  const [stats] = useState([
    {
      id: "portfolio",
      title: "Total Portfolio",
      value: "$2,450.80",
      change: "+12.5%",
      changePositive: true,
      icon: PieChart,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "profit",
      title: "Total Profit",
      value: "$567.32",
      change: "+8.2%",
      changePositive: true,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "balance",
      title: "Available Balance",
      value: "$1,203.45",
      change: "-2.1%",
      changePositive: false,
      icon: Wallet,
      color: "from-purple-500 to-pink-500",
    },
  ]);

  return (
    <div className="space-y-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card
            key={stat.id}
            className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    stat.changePositive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {stat.change}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white shadow-lg border-0 rounded-2xl">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">{t("quickActions")}</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm">
              {t("buyTokens")}
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm">
              {t("sellTokens")}
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm">
              {t("transferFunds")}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
