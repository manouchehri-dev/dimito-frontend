"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, ChevronRight, Eye } from "lucide-react";

export default function RecentTransactions() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isRTL = locale === "fa";

  // Mock transaction data - replace with real data
  const [transactions] = useState([
    {
      id: "1",
      type: "deposit",
      description: "Deposit from my Card",
      date: "21/10/2025",
      amount: "+$850",
      status: "completed",
    },
    {
      id: "2",
      type: "deposit",
      description: "Deposit from my Card",
      date: "21/10/2025",
      amount: "+$850",
      status: "completed",
    },
    {
      id: "3",
      type: "deposit",
      description: "Deposit from my Card",
      date: "21/10/2025",
      amount: "+$850",
      status: "completed",
    },
    {
      id: "4",
      type: "deposit",
      description: "Deposit from my Card",
      date: "21/10/2025",
      amount: "+$850",
      status: "completed",
    },
  ]);

  const getTransactionIcon = (type) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case "withdraw":
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAmountColor = (amount) => {
    return amount.startsWith("+") ? "text-green-600" : "text-red-600";
  };

  return (
    <Card className="w-full bg-white shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            {t("recentTransactions")}
          </CardTitle>
          <button className="flex items-center gap-1 text-sm text-[#FF5D1B] hover:text-[#FF4A0F] font-medium transition-colors">
            {t("viewAll")}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-500">{transaction.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`font-semibold text-sm ${getAmountColor(
                    transaction.amount
                  )}`}
                >
                  {transaction.amount}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-[#FF5D1B] hover:text-[#FF4A0F] transition-colors">
            <Eye className="w-4 h-4" />
            {t("viewAllTransactions")}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
