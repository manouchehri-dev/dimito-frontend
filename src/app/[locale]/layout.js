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
