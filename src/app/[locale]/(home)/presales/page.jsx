import { setRequestLocale } from "next-intl/server";
import PresalesPage from "@/components/dashboard/PresalesPage";
import { format } from "date-fns";
import { faIR, enUS } from "date-fns/locale";

export default async function PublicPresalesPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Orange Theme Matching */}
      <section className="relative bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF5D1B]/20 via-transparent to-[#FF363E]/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,93,27,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,54,62,0.1),transparent_50%)]"></div>
        </div>

        {/* Content */}
        <div className="relative pt-32 lg:pt-40 pb-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF5D1B]/20 to-[#FF363E]/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-orange-500/30">
                <div className="w-2 h-2 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-orange-300">
                  {locale === "fa" ? "🔥 پیش‌فروش‌های فعال" : "🔥 Live Presales"}
                </span>
              </div>

              {/* Main Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                {locale === "fa" ? (
                  <>
                    پیش‌فروش‌های
                    <span className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] bg-clip-text text-transparent"> DMT</span>
                  </>
                ) : (
                  <>
                    DMT Token
                    <span className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] bg-clip-text text-transparent"> Presales</span>
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-lg lg:text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
                {locale === "fa"
                  ? "در آینده معدن‌کاری دیجیتال سرمایه‌گذاری کنید و از سود تضمینی بهره‌مند شوید"
                  : "Invest in the future of digital mining and benefit from guaranteed returns"
                }
              </p>

              {/* Value Props - Orange Theme */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-emerald-400/30">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-sm font-medium text-emerald-300">
                    {locale === "fa" ? "سود تضمینی" : "Guaranteed Returns"}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-cyan-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-cyan-400/30">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-sm font-medium text-cyan-300">
                    {locale === "fa" ? "شفافیت کامل" : "Full Transparency"}
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-violet-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-violet-400/30">
                  <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                  <span className="text-sm font-medium text-violet-300">
                    {locale === "fa" ? "نقدشوندگی بالا" : "High Liquidity"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Presales Section - Website Style */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {locale === "fa" ? "پیش‌فروش‌های فعال" : "Active Presales"}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {locale === "fa"
                ? "فرصت‌های سرمایه‌گذاری منحصر به فرد در پروژه‌های معدنی تأیید شده را کشف کنید"
                : "Discover exclusive investment opportunities in verified mining projects"
              }
            </p>
          </div>

          {/* Presales Content */}
          <PresalesPage />
        </div>
      </section>

      {/* CTA Section - Website Style */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 lg:p-16 border border-gray-200">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              {locale === "fa"
                ? "آماده برای شروع سرمایه‌گذاری هستید؟"
                : "Ready to Start Your Investment Journey?"
              }
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              {locale === "fa"
                ? "کیف پول خود را متصل کنید و در پیش‌فروش‌های فعال شرکت کنید. آینده معدن‌کاری دیجیتال را تجربه کنید."
                : "Connect your wallet and participate in active presales. Experience the future of digital mining investments."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4A0F] hover:to-[#FF2A2A] text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-xl shadow-lg">
                {locale === "fa" ? "اتصال کیف پول" : "Connect Wallet"}
              </button>
              <button className="bg-white border-2 border-[#FF5D1B] text-[#FF5D1B] hover:bg-[#FF5D1B] hover:text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 hover:shadow-lg">
                {locale === "fa" ? "بیشتر بدانید" : "Learn More"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return {
    title:
      locale === "fa"
        ? "🔥 پیش‌فروش‌های DMT - سرمایه‌گذاری در آینده معدن‌کاری"
        : "🔥 DMT Presales - Invest in the Future of Mining",
    description:
      locale === "fa"
        ? "در پیش‌فروش‌های توکن‌های DMT شرکت کنید. سود تضمینی از معادن واقعی، شفافیت کامل و نقدشوندگی بالا."
        : "Participate in DMT token presales. Guaranteed returns from real mining, full transparency, and high liquidity.",
    keywords:
      locale === "fa"
        ? "پیش‌فروش, DMT, توکن, معدن‌کاری, سرمایه‌گذاری, بلاکچین"
        : "presale, DMT, token, mining, investment, blockchain",
  };
}
