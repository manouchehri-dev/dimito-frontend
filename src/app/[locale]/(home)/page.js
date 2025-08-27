import Hero from "@/components/Hero";
import Roadmap from "@/components/Roadmap";
import About from "@/components/About";
import Projects from "@/components/Projects";
import WhyBlockchain from "@/components/WhyBlockchain";
import FAQ from "@/components/FAQ";
import Tokenomics from "@/components/Tokenomics";
import MarketSection from "@/components/MarketSection";
import { setRequestLocale } from "next-intl/server";

import { Separator } from "@/components/ui/separator";

// Generate metadata for the home page
export async function generateMetadata({ params }) {
  const { locale } = await params;

  return {
    title: "DMT Token - Real-World Mining Meets Web3",
    description:
      "Invest in real, verified mineral assets through blockchain. The first digital token backed by real, mined assets.",
    alternates: {
      canonical: `/${locale}`,
    },
    openGraph: {
      title: "DMT Token - Real-World Mining Meets Web3",
      description:
        "Invest in real, verified mineral assets through blockchain. The first digital token backed by real, mined assets.",
      url: `/${locale}`,
      locale: locale,
    },
  };
}

export default async function Home({ params }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);
  return (
    <div className="min-h-full text-primary px-[28px] lg:px-[72px] relative">
      <Hero />
      <Separator className="border-[#FFB30F] border-1 my-5 lg:my-15" />
      <About />
      <Projects />
      <WhyBlockchain />
      <Roadmap />
      <Tokenomics />
      <MarketSection />
      <FAQ />
    </div>
  );
}
