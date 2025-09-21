import { setRequestLocale } from "next-intl/server";
import DashboardPage from "./DashboardPage";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const metadata = {
    en: {
      title: "Dashboard Overview - DMT Token Investment | DiMiTo",
      description: "Your complete DMT token investment dashboard. View portfolio statistics, recent purchases, participated presales, and manage your token balances in one place.",
      keywords: "DMT dashboard overview, investment portfolio, token statistics, presale tracking, wallet management"
    },
    fa: {
      title: "نمای کلی داشبورد - سرمایه‌گذاری توکن DMT | DiMiTo",
      description: "داشبورد کامل سرمایه‌گذاری توکن DMT شما. آمار پورتفولیو، خریدهای اخیر، پیش‌فروش‌های شرکت کرده و مدیریت موجودی توکن‌ها را در یک مکان مشاهده کنید.",
      keywords: "نمای کلی داشبورد DMT, پورتفولیو سرمایه‌گذاری, آمار توکن, پیگیری پیش‌فروش, مدیریت کیف پول"
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

export default async function DashboardPageWrapper({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DashboardPage />;
}
