import { setRequestLocale } from "next-intl/server";
import PresalesPage from "@/components/dashboard/PresalesPage";

export default async function PresalesPageRoute({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PresalesPage />;
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return {
    title:
      locale === "fa"
        ? "پیش‌فروش‌ها - داشبورد DiMiTo"
        : "Presales - DiMiTo Dashboard",
    description:
      locale === "fa"
        ? "مشاهده و شرکت در پیش‌فروش توکن‌های DMT"
        : "View and participate in DMT token presales",
  };
}
