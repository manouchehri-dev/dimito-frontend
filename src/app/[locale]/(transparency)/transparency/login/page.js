import { setRequestLocale } from "next-intl/server";
import LoginPage from "@/components/transparency/LoginPage";

export default async function TransparencyLoginPage({ params }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <LoginPage />;
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return {
    title:
      locale === "fa"
        ? "ورود به داشبورد شفافیت"
        : "Transparency Dashboard Login",
    description:
      locale === "fa"
        ? "برای مشاهده گزارش‌ها و داده‌های شفافیت وارد شوید"
        : "Login to access transparency reports and data",
  };
}
