import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import TokenDetailsPage from "@/components/TokenDetailsPage";

// Generate metadata for the page
export async function generateMetadata({ params }) {
    const { locale, id } = await params;

    const metadata = {
        en: {
            title: `DMT Token #${id} - Mining Asset Details | DiMiTo`,
            description: `Explore detailed information about DMT Token #${id}. View mining operations, presale status, transparency reports, and real-time performance metrics for this tokenized mining asset.`,
            keywords: `DMT token ${id}, mining token details, blockchain mining asset, token presale, mining transparency`
        },
        fa: {
            title: `توکن DMT #${id} - جزئیات دارایی معدنی | DiMiTo`,
            description: `اطلاعات تفصیلی درباره توکن DMT #${id} را کشف کنید. عملیات معدنکاری، وضعیت پیش‌فروش، گزارش‌های شفافیت و معیارهای عملکرد لحظه‌ای این دارایی معدنی توکن‌سازی شده را مشاهده کنید.`,
            keywords: `توکن DMT ${id}, جزئیات توکن معدنکاری, دارایی معدنی بلاکچین, پیش‌فروش توکن, شفافیت معدنکاری`
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

export default async function TokenDetailsPageRoute({ params }) {
    const { id } = await params;

    // Validate that id is a number
    if (!id || isNaN(parseInt(id))) {
        notFound();
    }

    return <TokenDetailsPage tokenId={parseInt(id)} />;
}
