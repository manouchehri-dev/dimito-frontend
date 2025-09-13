import { setRequestLocale } from "next-intl/server";
import ReportDetailPage from "@/components/transparency/ReportDetailPage";

export default async function TransparencyReportDetailPage({ params }) {
  const { locale, id } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <ReportDetailPage reportId={id} />;
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return {
    title:
      locale === "fa" ? "جزئیات گزارش شفافیت" : "Transparency Report Details",
    description:
      locale === "fa"
        ? "مشاهده جزئیات کامل گزارش شفافیت معدنی"
        : "View detailed transparency report for mining operations",
  };
}
