"use client";

import { useTranslations } from "next-intl";
import { RingLoader, PulseLoader } from "react-spinners";

export default function DashboardLoadingSpinner({ message, showSkeleton = false }) {
  const t = useTranslations("dashboard");

  if (showSkeleton) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-[16px] p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
              <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="border border-gray-200 rounded-[16px] p-4">
                    <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
      {/* React Spinners - RingLoader */}
      <div className="relative">
        <RingLoader
          color="#FF5D1B"
          size={80}
          speedMultiplier={0.8}
          cssOverride={{
            display: "block",
            borderWidth: "4px",
          }}
        />
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-gray-900">
          {message || t("loading")}
        </p>
        <p className="text-sm text-gray-500">
          {t("pleaseWait")}
        </p>
      </div>

      {/* React Spinners - PulseLoader for dots */}
      <PulseLoader
        color="#FF5D1B"
        size={8}
        margin={6}
        speedMultiplier={0.8}
      />
    </div>
  );
}
