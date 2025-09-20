import TokenListingForm from "./TokenListingForm";
import { setRequestLocale } from "next-intl/server";

// Generate metadata for the listing page
export async function generateMetadata({ params }) {
  const { locale } = await params;

  const metadata = {
    en: {
      title: "List Your Mining Project - Token Listing | DiMiTo",
      description: "Submit your mining project for tokenization on DiMiTo platform. Transform your real-world mining assets into blockchain tokens with complete transparency and global accessibility.",
      keywords: "token listing, mining project tokenization, blockchain listing, DMT token creation, mining asset tokenization"
    },
    fa: {
      title: "پروژه معدنی خود را لیست کنید - لیستینگ توکن | DiMiTo",
      description: "پروژه معدنی خود را برای توکن‌سازی در پلتفرم DiMiTo ارسال کنید. دارایی‌های معدنی دنیای واقعی خود را با شفافیت کامل و دسترسی جهانی به توکن‌های بلاکچین تبدیل کنید.",
      keywords: "لیستینگ توکن, توکن‌سازی پروژه معدنی, لیستینگ بلاکچین, ایجاد توکن DMT, توکن‌سازی دارایی معدنی"
    }
  };

  const currentMeta = metadata[locale] || metadata.en;

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    keywords: currentMeta.keywords,
    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      type: "website",
      locale: locale,
    },
  };
}

export default async function ListingPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TokenListingForm />;
}
