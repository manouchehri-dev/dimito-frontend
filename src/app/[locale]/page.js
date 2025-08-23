import Hero from "@/components/Hero";
import Roadmap from "@/components/Roadmap";
import About from "@/components/About";
import Projects from "@/components/Projects";
import WhyBlockchain from "@/components/WhyBlockchain";
import FAQ from "@/components/FAQ";
import Tokenomics from "@/components/Tokenomics";

import { Separator } from "@/components/ui/separator";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return {
    title: "Home - MID Token",
    description: "Home - MID Token",
  };
}

export default function Home() {
  return (
    <div className="min-h-full text-primary px-[28px] lg:px-[72px] relative">
      <Hero />
      <Separator className="border-[#FFB30F] border-1 my-10 lg:my-30" />
      <About />
      <Projects />
      <WhyBlockchain />
      <Roadmap />
      <Tokenomics />
      <FAQ />
    </div>
  );
}
