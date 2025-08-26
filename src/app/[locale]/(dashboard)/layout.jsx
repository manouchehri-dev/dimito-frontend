import { setRequestLocale } from "next-intl/server";
import DashboardLayout from "@/components/layout/DashboardLayout";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: "Dashboard - DMT Token",
    description: "Manage your DMT Tokens and track your portfolio",
  };
}

export default async function Layout({ children, params }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <DashboardLayout>{children}</DashboardLayout>;
}
