import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import TokenDetailsPage from "@/components/TokenDetailsPage";

// Generate metadata for the page
export async function generateMetadata({ params }) {
    const { locale, id } = await params;
    const t = await getTranslations({ locale, namespace: "tokenDetails" });

    return {
        title: `${t("tabs.overview")} - Token #${id} | DiMiTo`,
        description: t("overview.tokenInfo"),
    };
}

export default async function TokenDetailsPageRoute({ params }) {
    const { id } = await params;

    // Validate that id is a number
    if (!id || isNaN(parseInt(id))) {
        notFound();
    }

    return <TokenDetailsPage tokenId={parseInt(id)} />;
}
