import "../globals.css";

import { Poppins } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import Provider from "@/providers/WagmiProvider";
import QueryProvider from "@/providers/QueryProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

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

export default async function RootLayout({ children, params }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);
  // Safe message loading with fallback
  let messages = {};
  try {
    messages = await getMessages();
  } catch (error) {
    console.warn("Failed to load messages during build:", error);
    // Provide empty messages as fallback
    messages = {};
  }

  return (
    <html
      lang={locale || "en"}
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
          <QueryProvider>
            <NextIntlClientProvider locale={locale || "en"} messages={messages}>
              <Provider key={`provider-${locale}`}>
                <main className="flex-1">{children}</main>
              </Provider>
            </NextIntlClientProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
