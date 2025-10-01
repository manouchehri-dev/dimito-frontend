import { setRequestLocale } from "next-intl/server";
import SupportPageWrapper from "./SupportPageWrapper";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const metadata = {
    en: {
      title: "Support & Tickets - DMT Token Dashboard | DiMiTo",
      description: "Create and manage support tickets, get help with your DMT token investments, and track your support requests with our comprehensive ticketing system.",
      keywords: "DMT support, help desk, support tickets, customer service, technical support, investment help"
    },
    fa: {
      title: "پشتیبانی و تیکت‌ها - داشبورد توکن DMT | DiMiTo",
      description: "تیکت‌های پشتیبانی ایجاد و مدیریت کنید، برای سرمایه‌گذاری‌های توکن DMT کمک دریافت کنید و درخواست‌های پشتیبانی خود را با سیستم جامع تیکتینگ پیگیری کنید.",
      keywords: "پشتیبانی DMT, میز کمک, تیکت پشتیبانی, خدمات مشتری, پشتیبانی فنی, کمک سرمایه‌گذاری"
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

export default async function SupportPage({ params }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <SupportPageWrapper />;
}
