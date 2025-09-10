import { setRequestLocale } from "next-intl/server";
import AuthenticatedTransparencyDashboard from "@/components/transparency/AuthenticatedTransparencyDashboard";

export default async function TransparencyDashboardPage({ params }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <AuthenticatedTransparencyDashboard />;
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return {
    title: locale === "fa" ? "داشبورد شفافیت" : "Transparency Dashboard",
    description:
      locale === "fa"
        ? "داشبورد شفافیت برای مشاهده گزارش‌ها و داده‌ها"
        : "Transparency dashboard for viewing reports and data",
  };
}
