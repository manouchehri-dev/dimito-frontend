"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle, Search, TrendingUp, Shield, Eye, BarChart3 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

const FAQ = () => {
  const t = useTranslations("faq");
  const locale = useLocale();
  const isRTL = locale === "fa";
  const [openItems, setOpenItems] = useState([0]); // First item open by default
  const [searchTerm, setSearchTerm] = useState("");

  const faqData = [
    {
      question: t("questions.buyTokens.question"),
      answer: t("questions.buyTokens.answer"),
      category: "presales",
      icon: MessageCircle  // Presales/participation
    },
    {
      question: t("questions.tokenValue.question"),
      answer: t("questions.tokenValue.answer"),
      category: "tokenomics",
      icon: TrendingUp  // Value increase/growth
    },
    {
      question: t("questions.tokenValue2.question"),
      answer: t("questions.tokenValue2.answer"),
      category: "responsibility",
      icon: HelpCircle  // General question about responsibility
    },
    {
      question: t("questions.tokenValue3.question"),
      answer: t("questions.tokenValue3.answer"),
      category: "transparency",
      icon: Eye  // Transparency/visibility
    },
    {
      question: t("questions.tokenValue4.question"),
      answer: t("questions.tokenValue4.answer"),
      category: "trading",
      icon: BarChart3  // Trading/markets
    },
    {
      question: t("questions.tokenValue5.question"),
      answer: t("questions.tokenValue5.answer"),
      category: "security",
      icon: Shield  // Protection/security
    },
  ];

  const filteredFAQ = faqData.filter(
    item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleItem = (index) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
  };

  return (
    <section
      className="pb-16 lg:pb-24 relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-l from-[#FF5D1B]/5 to-[#FF363E]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-[clamp(16px,2.5vw,20px)] text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-12">
          <div className="relative">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={isRTL ? "جستجو در سوالات..." : "Search questions..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF5D1B]/20 focus:border-[#FF5D1B] transition-all duration-200 text-gray-900 placeholder-gray-500`}
            />
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((item, index) => {
              const IconComponent = item.icon;
              const isOpen = openItems.includes(index);

              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  {/* Question Header */}
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full flex items-center justify-between py-6 px-3 lg:p-8 text-start hover:bg-gray-50/50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isOpen
                          ? 'bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] shadow-lg'
                          : 'bg-gray-100 group-hover:bg-gray-200'
                          }`}>
                          <IconComponent className={`w-5 h-5 transition-colors duration-300 ${isOpen ? 'text-white' : 'text-gray-600'
                            }`} />
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm lg:text-lg font-semibold text-gray-900 leading-relaxed group-hover:text-[#FF5D1B] transition-colors duration-300">
                          {item.question}
                        </h3>
                      </div>
                    </div>

                    {/* Chevron Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen
                        ? 'bg-[#FF5D1B]/10 rotate-180'
                        : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                        <ChevronDown className={`w-4 h-4 transition-all duration-300 ${isOpen ? 'text-[#FF5D1B]' : 'text-gray-600'
                          }`} />
                      </div>
                    </div>
                  </button>

                  {/* Answer Content */}
                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                    <div className={`${isRTL ? "pr-6" : "pl-6"} pb-6 lg:pb-8`}>
                      <div className="border-l-2 border-gray-100">
                        <div className="pl-4">
                          <p className="text-gray-600 leading-relaxed text-base">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* No Results */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isRTL ? "نتیجه‌ای یافت نشد" : "No results found"}
              </h3>
              <p className="text-gray-600">
                {isRTL
                  ? "سوال مورد نظر خود را با کلمات دیگری جستجو کنید"
                  : "Try searching with different keywords"
                }
              </p>
            </div>
          )}
        </div>

        {/* Contact Support */}
        {/* <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {isRTL ? "سوال دیگری دارید؟" : "Still have questions?"}
            </h3>
            <p className="text-gray-600 mb-6">
              {isRTL
                ? "تیم پشتیبانی ما آماده کمک به شما است"
                : "Our support team is here to help you"
              }
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-semibold">
              <MessageCircle className="w-4 h-4" />
              <span>
                {isRTL ? "تماس با پشتیبانی" : "Contact Support"}
              </span>
            </button>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default FAQ;
