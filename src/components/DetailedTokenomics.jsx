"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useRouter } from "@/i18n/navigation";
import { Download, FileText, Share2 } from "lucide-react";
import CustomConnectButton from "./module/CustomConnectButton";

const DetailedTokenomics = () => {
  const t = useTranslations("tokenomics");
  const dt = useTranslations("detailedTokenomics");
  const isRTL = useLocale() === "fa";
  const router = useRouter();

  // Download functionality
  const handleDownloadPDF = () => {
    const link = document.createElement("a");
    link.href = "/docs/Tokenomics-fa.pdf";
    link.download = "DiMiTo-Tokenomics-fa.pdf";
    link.click();
  };

  const handleDownloadEn = () => {
    const link = document.createElement("a");
    link.href = "/docs/Tokenomics-en.pdf";
    link.download = "DiMiTo-Tokenomics-en.pdf";
    link.click();
  };

  const tokenomicsData = [
    {
      title: t("cards.network.title"),
      description: t("cards.network.description"),
      features: {
        title: t("cards.network.features.title"),
        items: [
          t("cards.network.features.items.0"),
          t("cards.network.features.items.1"),
          t("cards.network.features.items.2"),
        ],
      },
    },
    {
      title: t("cards.supply.title"),
      description: t("cards.supply.description"),
      features: {
        title: t("cards.supply.features.title"),
        items: [
          t("cards.supply.features.items.0"),
          t("cards.supply.features.items.1"),
          t("cards.supply.features.items.2"),
        ],
      },
    },
    {
      title: t("cards.allocation.title"),
      description: t("cards.allocation.description"),
      features: {
        title: t("cards.allocation.features.title"),
        items: [
          t("cards.allocation.features.items.0"),
          t("cards.allocation.features.items.1"),
          t("cards.allocation.features.items.2"),
        ],
      },
    },
    {
      title: t("cards.profitability.title"),
      description: t("cards.profitability.description"),
      features: {
        title: t("cards.profitability.features.title"),
        items: [
          t("cards.profitability.features.items.0"),
          t("cards.profitability.features.items.1"),
          t("cards.profitability.features.items.2"),
        ],
      },
    },
    {
      title: t("cards.markets.title"),
      description: t("cards.markets.description"),
      features: {
        title: t("cards.markets.features.title"),
        items: [
          t("cards.markets.features.items.0"),
          t("cards.markets.features.items.1"),
          t("cards.markets.features.items.2"),
        ],
      },
    },
    {
      title: t("cards.transparency.title"),
      description: t("cards.transparency.description"),
      features: {
        title: t("cards.transparency.features.title"),
        items: [
          t("cards.transparency.features.items.0"),
          t("cards.transparency.features.items.1"),
          t("cards.transparency.features.items.2"),
        ],
      },
    },
  ];

  return (
    <section className="py-12 lg:py-20" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Section with Primary Download Button */}
      <div className="text-center mb-16">
        <h1 className="text-4xl lg:text-6xl font-bold mb-6">
          {dt("hero.title")}
        </h1>
        <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
          {dt("hero.subtitle")}
        </p>

        {/* Primary Download CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <Button
            onClick={handleDownloadPDF}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            <Download className="w-5 h-5 mr-2" />
            توکنومیکس (فارسی)
          </Button>

          <Button
            onClick={handleDownloadEn}
            size="lg"
            className="bg-gradient-to-l from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            <FileText className="w-5 h-5 mr-2" />
            توکنومیکس (انگلیسی)
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Overview Section with Quick Download */}
        <Card className="mb-12 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl lg:text-3xl text-center flex-1">
              {dt("overview.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg leading-relaxed mb-6">
              {dt("overview.description")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">1B</div>
                <div className="text-sm text-gray-600">
                  {dt("overview.stats.totalTokens")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">BSC</div>
                <div className="text-sm text-gray-600">
                  {dt("overview.stats.blockchainNetwork")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">100%</div>
                <div className="text-sm text-gray-600">
                  {dt("overview.stats.throughPresales")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {tokenomicsData.map((data, index) => (
            <Card
              key={index}
              className="h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
            >
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white relative overflow-hidden">
                <CardTitle className="text-xl lg:text-2xl">
                  {data.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-lg mb-6 leading-relaxed">
                  {data.description}
                </p>
                {data.features && (
                  <div>
                    <h4 className="font-semibold text-lg mb-4 text-orange-600">
                      {data.features.title}
                    </h4>
                    <ul className="space-y-3">
                      {data.features.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-base leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-12" />

        {/* Legal Framework Section */}
        <Card className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl lg:text-3xl text-center text-blue-800">
              {dt("legal.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-green-700">
                  {dt("legal.buyersRights.title")}
                </h3>
                <ul className="space-y-2">
                  {[0, 1, 2].map((index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>{dt(`legal.buyersRights.items.${index}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-red-700">
                  {dt("legal.mineOwnersObligations.title")}
                </h3>
                <ul className="space-y-2">
                  {[0, 1, 2].map((index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <span>
                        {dt(`legal.mineOwnersObligations.items.${index}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action with Download Options */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                {dt("cta.title")}
              </h2>
              <p className="text-lg mb-6">{dt("cta.description")}</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <CustomConnectButton
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-3 cursor-pointer"
                >
                  {dt("cta.connectWallet")}
                </CustomConnectButton>
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100 px-6 py-3 cursor-pointer"
                  onClick={() => router.push("/whitepaper")}
                >
                  {dt("cta.readWhitepaper")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DetailedTokenomics;
