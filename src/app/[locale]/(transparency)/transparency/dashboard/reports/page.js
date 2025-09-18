import { setRequestLocale } from "next-intl/server";
import DashboardReportsPage from "@/components/transparency/DashboardReportsPage";

export default async function DashboardReportsPageRoute({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DashboardReportsPage />;
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return {
    title:
      locale === "fa"
        ? "مدیریت گزارش‌ها - سامانه شفافیت"
        : "Manage Reports - Transparency Platform",
    description:
      locale === "fa"
        ? "مدیریت و مشاهده تمام گزارش‌های شفافیت خود"
        : "Manage and view all your transparency reports",
  };
}
