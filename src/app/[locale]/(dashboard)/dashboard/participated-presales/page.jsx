import { setRequestLocale } from "next-intl/server";
import ParticipatedPresalesPageWrapper from "./ParticipatedPresalesPageWrapper";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const metadata = {
    en: {
      title: "Participated Presales - DMT Token Dashboard | DiMiTo",
      description: "Manage and track all your DMT token presale participations. Monitor investment progress, presale status, and manage your active and completed presale investments.",
      keywords: "DMT presale participation, presale tracking, investment management, presale portfolio, token presales"
    },
    fa: {
      title: "پیش‌فروش‌های شرکت کرده - داشبورد توکن DMT | DiMiTo",
      description: "تمام مشارکت‌های پیش‌فروش توکن DMT خود را مدیریت و پیگیری کنید. پیشرفت سرمایه‌گذاری، وضعیت پیش‌فروش و مدیریت سرمایه‌گذاری‌های فعال و تکمیل شده.",
      keywords: "مشارکت پیش‌فروش DMT, پیگیری پیش‌فروش, مدیریت سرمایه‌گذاری, پورتفولیو پیش‌فروش, پیش‌فروش توکن"
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

export default async function DashboardParticipatedPresalesPageRoute({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ParticipatedPresalesPageWrapper />;
}
