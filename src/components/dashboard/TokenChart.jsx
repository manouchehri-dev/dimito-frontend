"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

export default function TokenChart() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isRTL = locale === "fa";

  // Mock chart data - replace with real chart library like recharts
  const [chartData] = useState({
    currentPrice: "$8.52",
    change: "+15.2%",
    changePositive: true,
    period: "24h",
  });

  // Simple SVG chart placeholder - you can replace this with a proper chart library
  const ChartPlaceholder = () => (
    <div className="relative h-48 w-full bg-gradient-to-br from-orange-50 to-red-50 rounded-xl overflow-hidden">
      <svg
        className="w-full h-full"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF5D1B" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF363E" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Chart line */}
        <path
          d="M 0 120 Q 50 100 100 110 T 200 90 Q 250 80 300 70 T 400 60"
          stroke="#FF5D1B"
          strokeWidth="3"
          fill="none"
          className="drop-shadow-sm"
        />

        {/* Fill area under curve */}
        <path
          d="M 0 120 Q 50 100 100 110 T 200 90 Q 250 80 300 70 T 400 60 L 400 200 L 0 200 Z"
          fill="url(#chartGradient)"
        />

        {/* Data points */}
        <circle
          cx="100"
          cy="110"
          r="4"
          fill="#FF5D1B"
          className="drop-shadow-sm"
        />
        <circle
          cx="200"
          cy="90"
          r="4"
          fill="#FF5D1B"
          className="drop-shadow-sm"
        />
        <circle
          cx="300"
          cy="70"
          r="4"
          fill="#FF5D1B"
          className="drop-shadow-sm"
        />
      </svg>

      {/* Chart overlay info */}
      <div className="absolute top-4 left-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                chartData.changePositive ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm font-medium text-gray-700">
              {chartData.currentPrice}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full bg-white shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#FF5D1B]" />
            {t("tokenChart")}
          </CardTitle>
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              chartData.changePositive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {chartData.changePositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {chartData.change}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Price Info */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {chartData.currentPrice}
            </span>
            <span className="text-sm text-gray-500">
              SIP Token • {chartData.period}
            </span>
          </div>
        </div>

        {/* Chart */}
        <ChartPlaceholder />

        {/* Chart Period Selector */}
        <div className="mt-4 flex justify-center">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {["1H", "24H", "7D", "30D", "1Y"].map((period) => (
              <button
                key={period}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  period === "24H"
                    ? "bg-white text-[#FF5D1B] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
