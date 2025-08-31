import { setRequestLocale } from "next-intl/server";
import DetailedTokenomics from "@/components/DetailedTokenomics";

// Generate metadata for the tokenomics page
export async function generateMetadata({ params }) {
  const { locale } = await params;

  return {
    title: "DiMiTo Tokenomics - Complete Economic Model",
    description:
      "Comprehensive tokenomics of DiMiTo: token distribution, capital allocation, profit mechanisms, and transparency systems.",
    alternates: {
      canonical: `/${locale}/tokenomics`,
    },
    openGraph: {
      title: "DiMiTo Tokenomics - Complete Economic Model",
      description:
        "Comprehensive tokenomics of DiMiTo: token distribution, capital allocation, profit mechanisms, and transparency systems.",
      url: `/${locale}/tokenomics`,
      locale: locale,
    },
  };
}

export default async function TokenomicsPage({ params }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <div className="min-h-full text-primary px-[28px] lg:px-[72px] pt-[140px] lg:pt-[180px] relative">
      <DetailedTokenomics />
    </div>
  );
}
