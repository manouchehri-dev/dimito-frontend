import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import PresaleBuyPage from "@/components/PresaleBuyPage";

// Generate metadata for the page
export async function generateMetadata({ params }) {
  const { locale, presaleId } = await params;
  const t = await getTranslations({ locale, namespace: "presaleBuy" });

  return {
    title: `${t("title")} - Token #${presaleId} | DiMiTo`,
    description: t("input.tokenAmount"),
  };
}

export default async function PresaleBuyPageRoute({ params }) {
  const { tokenId } = await params;
  const preSaleId = parseInt(tokenId);

  // Validate that presaleId is a number
  if (!preSaleId || isNaN(parseInt(preSaleId))) {
    notFound();
  }

  // Since each token has only 1 presale, we can use the same ID
  return <PresaleBuyPage preSaleId={parseInt(preSaleId)} />;
}
