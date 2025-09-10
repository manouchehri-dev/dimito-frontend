import { setRequestLocale } from "next-intl/server";
import TransparencyMainPage from "@/components/transparency/TransparencyMainPage";

export default async function TransparencyPage({ params }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <TransparencyMainPage />;
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return {
    title: locale === "fa" ? "گزارش‌های شفافیت" : "Transparency Reports",
    description:
      locale === "fa"
        ? "مشاهده گزارش‌های شفافیت و داده‌های مالی عملیات معدنی"
        : "View transparency reports and financial data for mining operations",
  };
}
