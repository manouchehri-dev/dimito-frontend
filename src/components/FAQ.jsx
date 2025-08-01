"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQ = () => {
  const [openItems, setOpenItems] = useState([0]); // First item open by default

  const faqData = [
    {
      question: "How can I buy tokens?",
      answer:
        "Through reputable online exchanges or directly from the official IMD Token website with a digital wallet connection. Step-by-step purchasing instructions are also available on the site.",
    },
    {
      question: "How is the token's value maintained?",
      answer:
        "The token's value is maintained through real mineral asset backing, market demand, and transparent blockchain technology that ensures trust and stability.",
    },
    {
      question: "How is the token's value maintained?",
      answer:
        "The token's value is maintained through real mineral asset backing, market demand, and transparent blockchain technology that ensures trust and stability.",
    },
    {
      question: "How is the token's value maintained?",
      answer:
        "The token's value is maintained through real mineral asset backing, market demand, and transparent blockchain technology that ensures trust and stability.",
    },
    {
      question: "How is the token's value maintained?",
      answer:
        "The token's value is maintained through real mineral asset backing, market demand, and transparent blockchain technology that ensures trust and stability.",
    },
  ];

  const toggleItem = (index) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-16 lg:py-24 px-4 lg:px-20 bg-[#F5F3F0]">
      {/* Header */}
      <div className="text-start lg:text-left mb-6 lg:mb-16">
        <div className="inline-block">
          <h2 className="text-[14px] lg:text-2xl font-bold text-primary mb-2">
            FAQ
          </h2>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            {/* Question Header */}
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-4 lg:p-6 text-left hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                {/* Red dot indicator */}
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm lg:text-base font-medium text-gray-800">
                  {item.question}
                </span>
              </div>

              {/* Chevron Icon */}
              <div className="flex-shrink-0 ml-4">
                {openItems.includes(index) ? (
                  <ChevronUp className="w-5 h-5 text-red-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-red-500" />
                )}
              </div>
            </button>

            {/* Answer Content */}
            {openItems.includes(index) && (
              <div className="px-4 lg:px-6 pb-4 lg:pb-6">
                <div className="pl-5">
                  <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
