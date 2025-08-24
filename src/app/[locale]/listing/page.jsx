import { setRequestLocale } from "next-intl/server";
import TokenListingForm from "./TokenListingForm";

export default async function TokenListingPage({ params }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <TokenListingForm />;
}
