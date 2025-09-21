import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import PresaleBuyPage from "@/components/PresaleBuyPage";

// Generate metadata for the page
export async function generateMetadata({ params }) {
  const { locale, tokenId } = await params;
  const t = await getTranslations({ locale, namespace: "presaleBuy" });

  return {
    title: `${t("title")} - Token #${tokenId} | DiMiTo`,
    description: t("input.tokenAmount"),
  };
}

export default async function PresaleBuyPageRoute({ params }) {
  const { tokenId } = await params;
  
  // Clean tokenId by removing any commas or non-numeric characters except for the ID itself
  const cleanTokenId = tokenId.toString().replace(/[^0-9]/g, '');
  const preSaleId = parseInt(cleanTokenId);

  // Validate that presaleId is a number
  if (!preSaleId || isNaN(preSaleId)) {
    notFound();
  }

  // Since each token has only 1 presale, we can use the same ID
  return <PresaleBuyPage preSaleId={preSaleId} />;
}
