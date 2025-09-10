import { setRequestLocale } from "next-intl/server";
import TransparencyHeader from "@/components/transparency/TransparencyHeader";
import TransparencyFooter from "@/components/transparency/TransparencyFooter";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return {
    title: {
      template:
        locale === "fa" ? "%s | شفافیت DiMiTo" : "%s | DiMiTo Transparency",
      default: locale === "fa" ? "شفافیت DiMiTo" : "DiMiTo Transparency",
    },
    description:
      locale === "fa"
        ? "پلتفرم شفافیت DiMiTo - مشاهده گزارش‌های مالی و عملیاتی معادن"
        : "DiMiTo Transparency Platform - View financial and operational mining reports",
    keywords:
      locale === "fa"
        ? "شفافیت، گزارش مالی، معدن، بلاکچین، DiMiTo"
        : "transparency, financial reports, mining, blockchain, DiMiTo",
  };
}

export default async function TransparencyLayout({ children, params }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <>
      <TransparencyHeader />
      <main className="min-h-screen">{children}</main>
      <TransparencyFooter />
    </>
  );
}
