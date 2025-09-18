import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingPresaleButton from "@/components/FloatingPresaleButton";

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
  return {
    title: "DMT Token - Real-World Mining Meets Web3",
    description:
      "Invest in real, verified mineral assets through blockchain. The first digital token backed by real, mined assets.",
    keywords:
      "blockchain, mining, cryptocurrency, DMT Token, mineral assets, web3, DeFi",
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
      title: "DMT Token - Real-World Mining Meets Web3",
      description:
        "Invest in real, verified mineral assets through blockchain. The first digital token backed by real, mined assets.",
      url: `/${locale}`,
      siteName: "DMT Token",
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
      title: "DMT Token - Real-World Mining Meets Web3",
      description:
        "Invest in real, verified mineral assets through blockchain. The first digital token backed by real, mined assets.",
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
      <Header />
      {children}
      <Footer />
      <FloatingPresaleButton />
    </>
  );
}
