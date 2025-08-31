"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useState } from "react";
import { Download, FileText } from "lucide-react";

const Whitepaper = () => {
  const t = useTranslations("whitepaper");
  const isRTL = useLocale() === "fa";
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", key: "overview" },
    { id: "technical", key: "technical" },
    { id: "tokenomics", key: "tokenomics" },
    { id: "legal", key: "legal" },
    { id: "roadmap", key: "roadmap" },
  ];

  const handleDownloadPDF = () => {
    const link = document.createElement("a");
    link.href = "/docs/WhitePaper.pdf";
    link.download = "DiMiTo-Whitepaper.pdf";
    link.click();
  };

  return (
    <section className="py-12 lg:py-20" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl lg:text-6xl font-bold mb-6">
          {t("hero.title")}
        </h1>
        <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
          {t("hero.subtitle")}
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 border-b border-gray-200 pb-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 cursor-pointer ${
                activeSection === section.id
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                  : "text-gray-600 hover:text-orange-500 hover:bg-orange-50"
              }`}
            >
              {t(`navigation.${section.key}`)}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {activeSection === "overview" && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl lg:text-3xl text-center">
                {t("sections.overview.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-lg leading-relaxed">
                  {t("sections.overview.description")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg"
                    >
                      <h3 className="font-semibold text-lg mb-3 text-orange-700">
                        {t(`sections.overview.highlights.${index}.title`)}
                      </h3>
                      <p className="text-gray-700">
                        {t(`sections.overview.highlights.${index}.description`)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "technical" && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl lg:text-3xl text-center">
                {t("sections.technical.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-lg leading-relaxed">
                  {t("sections.technical.description")}
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-blue-700">
                      {t("sections.technical.blockchain.title")}
                    </h3>
                    <ul className="space-y-2">
                      {[0, 1, 2].map((index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <span>
                            {t(
                              `sections.technical.blockchain.features.${index}`
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-green-700">
                      {t("sections.technical.smart_contracts.title")}
                    </h3>
                    <ul className="space-y-2">
                      {[0, 1, 2].map((index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <span>
                            {t(
                              `sections.technical.smart_contracts.features.${index}`
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "tokenomics" && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl lg:text-3xl text-center">
                {t("sections.tokenomics.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-lg leading-relaxed">
                  {t("sections.tokenomics.description")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="bg-orange-50 p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      1B
                    </div>
                    <div className="text-sm text-gray-600">
                      {t("sections.tokenomics.supply.total")}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      BSC
                    </div>
                    <div className="text-sm text-gray-600">
                      {t("sections.tokenomics.supply.network")}
                    </div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      100%
                    </div>
                    <div className="text-sm text-gray-600">
                      {t("sections.tokenomics.supply.presale")}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      2.5x
                    </div>
                    <div className="text-sm text-gray-600">
                      {t("sections.tokenomics.supply.collateral")}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "legal" && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl lg:text-3xl text-center">
                {t("sections.legal.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-lg leading-relaxed">
                  {t("sections.legal.description")}
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-green-700">
                      {t("sections.legal.compliance.title")}
                    </h3>
                    <ul className="space-y-2">
                      {[0, 1, 2].map((index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <span>
                            {t(`sections.legal.compliance.items.${index}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-blue-700">
                      {t("sections.legal.transparency.title")}
                    </h3>
                    <ul className="space-y-2">
                      {[0, 1, 2].map((index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <span>
                            {t(`sections.legal.transparency.items.${index}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "roadmap" && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl lg:text-3xl text-center">
                {t("sections.roadmap.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-lg leading-relaxed">
                  {t("sections.roadmap.description")}
                </p>
                <div className="space-y-6">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {t(`sections.roadmap.phases.${index}.title`)}
                        </h3>
                        <p className="text-gray-700">
                          {t(`sections.roadmap.phases.${index}.description`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "team" && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl lg:text-3xl text-center">
                {t("sections.team.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-lg leading-relaxed">
                  {t("sections.team.description")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-6 rounded-lg text-center"
                    >
                      <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                        {t(`sections.team.members.${index}.initials`)}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {t(`sections.team.members.${index}.name`)}
                      </h3>
                      <p className="text-orange-600 font-medium mb-2">
                        {t(`sections.team.members.${index}.role`)}
                      </p>
                      <p className="text-gray-700 text-sm">
                        {t(`sections.team.members.${index}.bio`)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator className="my-12" />

        {/* Download Call-to-Action */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl lg:text-3xl text-center text-center">
              {t("pdfSection.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto flex items-center justify-center mb-6">
                <FileText className="w-12 h-12 text-white" />
              </div>

              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t("pdfSection.description")}
              </p>

              <Button
                onClick={handleDownloadPDF}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white cursor-pointer"
              >
                <Download className="w-5 h-5 mr-2" />
                {t("pdfSection.downloadButton")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Whitepaper;
