import "../globals.css";

import { Poppins } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Toaster } from "react-hot-toast";

import Provider from "@/providers/WagmiProvider";
import QueryProvider from "@/providers/QueryProvider";
import AuthInitializer from "@/components/auth/AuthInitializer";
import GoftinoChat from "@/components/support/GoftinoChat";
import GoftinoCustomButton from "@/components/support/GoftinoCustomButton";
import Script from "next/script";

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
        <link
          rel="icon"
          href="/favicon-96x96.png"
          sizes="96x96"
          type="image/png"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="application-name" content="DMT Token" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DMT Token" />
        <meta name="mobile-web-app-capable" content="yes" />

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

        <QueryProvider>
          <NextIntlClientProvider locale={locale || "fa"} messages={messages}>
            <Provider key={`provider-${locale || "fa"}`}>
              <AuthInitializer />
              <main className="flex-1">{children}</main>
              <Toaster
                position="top-center"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                  // Default options for all toasts
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    maxWidth: '500px',
                    wordBreak: 'break-word'
                  },
                  // Specific styles for different types
                  success: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                  loading: {
                    duration: Infinity,
                    iconTheme: {
                      primary: '#3B82F6',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              {/* Goftino Chat Integration */}
              <GoftinoChat />
              <GoftinoCustomButton />
              
              {/* Goftino Widget Script */}
              <Script
                id="goftino-widget"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `!function(){var i="d9Hdxw",a=window,d=document;function g(){var g=d.createElement("script"),s="https://www.goftino.com/widget/"+i,l=localStorage.getItem("goftino_"+i);g.async=!0,g.src=l?s+"?o="+l:s;d.getElementsByTagName("head")[0].appendChild(g);}"complete"===d.readyState?g():a.attachEvent?a.attachEvent("onload",g):a.addEventListener("load",g,!1);}();`,
                }}
              />
            </Provider>
          </NextIntlClientProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
