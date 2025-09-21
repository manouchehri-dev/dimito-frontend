import { setRequestLocale } from "next-intl/server";
import DashboardLayout from "@/components/layout/DashboardLayout";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const metadata = {
    en: {
      title: "Investment Dashboard - DMT Token | DiMiTo",
      description: "Manage your DMT token investments, track portfolio performance, and participate in presales. Complete investment dashboard with real-time data and comprehensive analytics.",
      keywords: "DMT dashboard, token investment, portfolio management, presale participation, blockchain investment"
    },
    fa: {
      title: "داشبورد سرمایه‌گذاری - توکن DMT | DiMiTo",
      description: "سرمایه‌گذاری‌های توکن DMT خود را مدیریت کنید، عملکرد پورتفولیو را پیگیری کنید و در پیش‌فروش‌ها شرکت کنید. داشبورد کامل سرمایه‌گذاری با داده‌های لحظه‌ای و تحلیل‌های جامع.",
      keywords: "داشبورد DMT, سرمایه‌گذاری توکن, مدیریت پورتفولیو, شرکت در پیش‌فروش, سرمایه‌گذاری بلاکچین"
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
    twitter: {
      card: "summary_large_image",
      title: currentMeta.title,
      description: currentMeta.description,
    },
  };
}

export default async function Layout({ children, params }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <DashboardLayout>{children}</DashboardLayout>;
}
