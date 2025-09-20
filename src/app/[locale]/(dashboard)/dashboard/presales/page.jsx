import { setRequestLocale } from "next-intl/server";
import PresalesPage from "@/components/dashboard/PresalesPage";

export default async function PresalesPageRoute({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PresalesPage />;
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const metadata = {
    en: {
      title: "DMT Token Presales - Investment Dashboard | DiMiTo",
      description: "Explore active and upcoming DMT token presales. Invest in real-world mining projects with complete transparency, real-time status updates, and secure blockchain technology.",
      keywords: "DMT presales, token investment, mining presales, blockchain investment, cryptocurrency presales"
    },
    fa: {
      title: "پیش‌فروش‌های توکن DMT - داشبورد سرمایه‌گذاری | DiMiTo",
      description: "پیش‌فروش‌های فعال و آینده توکن‌های DMT را کشف کنید. با شفافیت کامل، به‌روزرسانی‌های وضعیت لحظه‌ای و فناوری امن بلاکچین در پروژه‌های معدنی دنیای واقعی سرمایه‌گذاری کنید.",
      keywords: "پیش‌فروش DMT, سرمایه‌گذاری توکن, پیش‌فروش معدنکاری, سرمایه‌گذاری بلاکچین, پیش‌فروش ارز دیجیتال"
    }
  };

  const currentMeta = metadata[locale] || metadata.en;

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    keywords: currentMeta.keywords,
    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      type: "website",
      locale: locale,
    },
  };
}
