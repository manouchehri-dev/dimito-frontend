"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function TokenBalanceCard() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isRTL = locale === "fa";

  // Mock data - replace with real data from your API/blockchain
  const [tokenBalance] = useState({
    amount: "17855",
    symbol: "SIP",
    usdValue: "152.8",
    change: "+12.5%",
    changePositive: true,
  });

  const handleBuy = () => {
    // TODO: Implement buy functionality
    console.log("Buy token clicked");
  };

  const handleWithdraw = () => {
    // TODO: Implement withdraw functionality
    console.log("Withdraw clicked");
  };

  return (
    <Card className="w-full bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{t("amount")}</h3>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              tokenBalance.changePositive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            {tokenBalance.change}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Token Amount Display */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl sm:text-4xl font-bold text-gray-900">
              {tokenBalance.amount}
            </span>
            <span className="text-lg font-medium text-gray-500">
              {tokenBalance.symbol} Token
            </span>
          </div>
          <div className="text-lg text-gray-600">${tokenBalance.usdValue}</div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleBuy}
            className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4A0F] hover:to-[#FF2A2A] text-white font-medium py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            {t("buy")}
          </Button>

          <Button
            onClick={handleWithdraw}
            variant="outline"
            className="border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:bg-gray-50"
          >
            <ArrowDownLeft className="w-4 h-4 mr-2" />
            {t("withdraw")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
