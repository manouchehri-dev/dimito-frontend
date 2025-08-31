import { setRequestLocale } from "next-intl/server";
import Whitepaper from "@/components/Whitepaper";

// Generate metadata for the whitepaper page
export async function generateMetadata({ params }) {
  const { locale } = await params;

  return {
    title: "DiMiTo Whitepaper - Technical & Economic Overview",
    description:
      "Complete technical documentation and economic model of DiMiTo: blockchain-based mining investment platform with transparency and legal framework.",
    alternates: {
      canonical: `/${locale}/whitepaper`,
    },
    openGraph: {
      title: "DiMiTo Whitepaper - Technical & Economic Overview",
      description:
        "Complete technical documentation and economic model of DiMiTo: blockchain-based mining investment platform with transparency and legal framework.",
      url: `/${locale}/whitepaper`,
      locale: locale,
    },
  };
}

export default async function WhitepaperPage({ params }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <div className="min-h-full text-primary px-[28px] lg:px-[72px] pt-[100px] lg:pt-[140px] relative">
      <Whitepaper />
    </div>
  );
}
