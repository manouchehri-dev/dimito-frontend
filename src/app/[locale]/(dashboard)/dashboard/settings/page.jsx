"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, User, Bell, Globe, Shield, Palette } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const t = useTranslations("dashboard");
  const router = useRouter();

  const settingsCategories = [
    {
      title: t("settings.profile.title"),
      description: t("settings.profile.description"),
      icon: User,
      color: "text-blue-600 bg-blue-50",
      comingSoon: true
    },
    {
      title: t("settings.notifications.title"),
      description: t("settings.notifications.description"),
      icon: Bell,
      color: "text-orange-600 bg-orange-50",
      comingSoon: true
    },
    {
      title: t("settings.language.title"),
      description: t("settings.language.description"),
      icon: Globe,
      color: "text-green-600 bg-green-50",
      comingSoon: false,
      note: t("settings.language.note")
    },
    {
      title: t("settings.security.title"),
      description: t("settings.security.description"),
      icon: Shield,
      color: "text-red-600 bg-red-50",
      comingSoon: true
    },
    {
      title: t("settings.appearance.title"),
      description: t("settings.appearance.description"),
      icon: Palette,
      color: "text-purple-600 bg-purple-50",
      comingSoon: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-7 h-7 text-orange-500" />
            {t("settings.title")}
          </h1>
          <p className="text-gray-600 mt-1">{t("settings.subtitle")}</p>
        </div>
      </div>

      {/* Settings Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid gap-4">
          {settingsCategories.map((category, index) => {
            const Icon = category.icon;
            
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border border-gray-200 ${
                  category.comingSoon 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:shadow-md cursor-pointer'
                } transition-all duration-200`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${category.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {category.title}
                      </h3>
                      {category.comingSoon && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                          {t("settings.comingSoon")}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {category.description}
                    </p>
                    
                    {category.note && (
                      <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        {category.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <h4 className="font-medium text-orange-900 mb-1">
              {t("settings.infoTitle")}
            </h4>
            <p className="text-sm text-orange-700">
              {t("settings.infoDescription")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
