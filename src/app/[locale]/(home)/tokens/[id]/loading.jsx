import { Coins, BarChart3, ShoppingCart, Zap, FileText } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen pt-[100px] lg:pt-[140px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
            <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs and content skeleton */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Tabs skeleton */}
            <div className="border-b border-gray-200 px-6">
              <nav className="flex space-x-8" aria-label="Tabs">
                {[
                  { icon: BarChart3, label: "Overview" },
                  { icon: ShoppingCart, label: "Presales" },
                  { icon: Zap, label: "Mines" },
                  { icon: FileText, label: "Reports" },
                ].map((tab, index) => {
                  const Icon = tab.icon;
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 ${
                        index === 0 ? "border-[#FF5D1B]" : "border-transparent"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-gray-400" />
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Content skeleton */}
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-56"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
