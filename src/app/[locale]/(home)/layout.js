import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingPresaleButton from "@/components/FloatingPresaleButton";
import { Toaster } from "react-hot-toast";

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#ffffff",
  };
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fa" }];
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  
  const metadata = {
    en: {
      title: "DMT Token - Real-World Mining Meets Web3",
      description: "Invest in real, verified mineral assets through blockchain. The first digital token backed by real, mined assets.",
      keywords: "blockchain, mining, cryptocurrency, DMT Token, mineral assets, web3, DeFi, presale, tokenization",
      siteName: "DMT Token"
    },
    fa: {
      title: "توکن DMT - معدنکاری واقعی ملاقات می‌کند با وب۳",
      description: "در دارایی‌های معدنی واقعی و تأیید شده از طریق بلاکچین سرمایه‌گذاری کنید. اولین توکن دیجیتال پشتیبانی شده توسط دارایی‌های واقعی استخراج شده.",
      keywords: "بلاکچین, معدنکاری, ارز دیجیتال, توکن DMT, دارایی‌های معدنی, وب۳, دیفای, پیش‌فروش, توکن‌سازی",
      siteName: "توکن DMT"
    }
  };

  const currentMeta = metadata[locale] || metadata.en;

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    keywords: currentMeta.keywords,
    authors: [{ name: "DMT Token Team" }],
    creator: "DMT Token",
    publisher: "DMT Token",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL("https://imdtoken.io"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        fa: "/fa",
      },
    },
    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      url: `/${locale}`,
      siteName: currentMeta.siteName,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
        },
      ],
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: currentMeta.title,
      description: currentMeta.description,
      images: ["/og-image.png"],
    },
    icons: {
      icon: [
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        {
          rel: "mask-icon",
          url: "/safari-pinned-tab.svg",
          color: "#FF5D1B",
        },
      ],
    },
    manifest: "/site.webmanifest",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function Layout({ children }) {
  return (
    <>
      {/* Global Background Elements */}
      <div className="fixed inset-0 -z-20">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-100"></div>

        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#FF5D1B]/20 to-[#FF363E]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-[#FF363E]/15 to-[#FF5D1B]/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-orange-200/30 to-red-200/30 rounded-full blur-2xl animate-pulse delay-500"></div>

        {/* Geometric patterns */}
        <div className="absolute top-32 right-20 w-4 h-4 bg-[#FF5D1B]/40 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-40 left-32 w-6 h-6 bg-[#FF363E]/40 rounded-full animate-bounce delay-700"></div>
        <div className="absolute top-1/3 left-20 w-3 h-3 bg-orange-400/50 rounded-full animate-bounce delay-1000"></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #FF5D1B 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <Header />
      {children}
      <Footer />
      <FloatingPresaleButton />
    </>
  );
}
