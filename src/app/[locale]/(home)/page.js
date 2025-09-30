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

  const metadata = {
    en: {
      title: "DMT Token - Real-World Mining Meets Web3 | Home",
      description: "Discover DiMiTo - the revolutionary platform connecting real-world mining with blockchain technology. Invest in verified mineral assets through DMT tokens with complete transparency and security."
    },
    fa: {
      title: "توکن DMT - معدنکاری واقعی ملاقات می‌کند با وب۳ | خانه",
      description: "DiMiTo را کشف کنید - پلتفرم انقلابی که معدنکاری دنیای واقعی را با فناوری بلاکچین متصل می‌کند. با شفافیت و امنیت کامل در دارایی‌های معدنی تأیید شده از طریق توکن‌های DMT سرمایه‌گذاری کنید."
    }
  };

  const currentMeta = metadata[locale] || metadata.en;

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    alternates: {
      canonical: `/${locale}`,
    },
    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
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
    <div className="min-h-full text-primary lg:px-[72px] relative">
      <Hero />
      <Separator className="border-[#FFB30F] border-1 my-5 -mt-10 lg:my-12 lg:-mt-6" />
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
