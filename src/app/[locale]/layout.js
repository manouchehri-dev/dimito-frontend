import { Poppins } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Provider from "@/providers/WagmiProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export async function generateViewport({ params }) {
  const { locale } = await params;

  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#ffffff",
  };
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return {
    title: "IMD Token - Real-World Mining Meets Web3",
    description:
      "Invest in real, verified mineral assets through blockchain. The first digital token backed by real, mined assets.",
    keywords:
      "blockchain, mining, cryptocurrency, IMD token, mineral assets, web3, DeFi",
    authors: [{ name: "IMD Token Team" }],
    creator: "IMD Token",
    publisher: "IMD Token",
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
      title: "IMD Token - Real-World Mining Meets Web3",
      description:
        "Invest in real, verified mineral assets through blockchain. The first digital token backed by real, mined assets.",
      url: `/${locale}`,
      siteName: "IMD Token",
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
      title: "IMD Token - Real-World Mining Meets Web3",
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

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      dir={locale === "fa" ? "rtl" : "ltr"}
      className="scroll-smooth"
    >
      <head>
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#FF5D1B" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Preload important resources */}
        <link
          rel="preload"
          href="/fonts/IRANSansX-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/IRANSansX-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
      </head>
      <body className={`antialiased font-iransans`}>
        <ErrorBoundary>
          <NextIntlClientProvider key={locale}>
            <Provider key={`provider-${locale}`}>
              <main className="flex-1">
                <Header />
                {children}
                <Footer />
              </main>
            </Provider>
          </NextIntlClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
