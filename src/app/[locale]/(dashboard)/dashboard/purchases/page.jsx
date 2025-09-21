import { setRequestLocale } from "next-intl/server";
import PurchasesPageWrapper from "./PurchasesPageWrapper";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const metadata = {
    en: {
      title: "Purchase History - DMT Token Dashboard | DiMiTo",
      description: "View and manage all your DMT token purchases. Track transaction history, purchase status, and export your investment data with comprehensive filtering options.",
      keywords: "DMT purchase history, token transactions, investment tracking, purchase management, transaction history"
    },
    fa: {
      title: "تاریخچه خریدها - داشبورد توکن DMT | DiMiTo",
      description: "تمام خریدهای توکن DMT خود را مشاهده و مدیریت کنید. تاریخچه تراکنش‌ها، وضعیت خریدها و صادرات داده‌های سرمایه‌گذاری با گزینه‌های فیلتر جامع.",
      keywords: "تاریخچه خرید DMT, تراکنش‌های توکن, پیگیری سرمایه‌گذاری, مدیریت خرید, تاریخچه تراکنش"
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

export default async function DashboardPurchasesPageRoute({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PurchasesPageWrapper />;
}
