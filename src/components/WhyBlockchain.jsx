import React from "react";

const WhyBlockchain = () => {
  const benefits = [
    "Transparency and tracking of transactions",
    "Smart contracts for profit distribution",
    "Resistance to corruption and manipulation",
    "Global access to investment",
  ];

  return (
    <section
      id="why-blockchain"
      className="bg-gray-100 pt-12 lg:my-20 lg:mb-30"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="lg:pl-10">
          {/* Header */}
          <div className="flex flex-col items-center justify-center lg:items-start mb-2">
            <h1 className="text-[14px] lg:text-[24px] font-bold text-center font-poppins">
              Why do we use blockchain?
            </h1>
          </div>

          {/* Benefits List with Connected Design */}
          <div className="relative max-w-2xl mx-auto lg:mx-0 border-l-4 border-[#FF5D1B] border-t-4 rounded-t-xl rounded-r-none py-10">
            {/* Benefits */}
            <div className="space-y-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="relative flex items-center">
                  {/* Horizontal connector line */}
                  <div className="absolute left-0 w-12 h-0.5 bg-gradient-to-r from-red-500 to-orange-500"></div>

                  {/* Arrow/connector dot */}
                  <div className="absolute left-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md transform -translate-x-1/2"></div>

                  {/* Arrow shape */}
                  <div className="absolute left-12 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[8px] border-t-transparent border-b-transparent border-l-red-500"></div>

                  {/* Benefit text */}
                  <div className="ml-16 bg-white w-full px-1 py-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <p className="text-[14px] lg:text-[24px]">{benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-[28px] lg:rounded-[36px] overflow-hidden my-10 w-[335px] lg:w-[684px] h-[335px] lg:h-[452px]">
          <img
            src={"/images/blockchain.jpg"}
            alt="blockchain"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default WhyBlockchain;
