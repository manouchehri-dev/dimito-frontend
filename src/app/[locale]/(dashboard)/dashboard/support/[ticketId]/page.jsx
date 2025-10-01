import { setRequestLocale } from "next-intl/server";
import TicketDetailsPageWrapper from "./TicketDetailsPageWrapper";

export async function generateMetadata({ params }) {
  const { locale, ticketId } = await params;

  const metadata = {
    en: {
      title: `Ticket ${ticketId} - Support Dashboard | DiMiTo`,
      description: "View and manage your support ticket, add comments, and track resolution progress.",
      keywords: "support ticket, help desk, customer service, ticket details"
    },
    fa: {
      title: `تیکت ${ticketId} - داشبورد پشتیبانی | DiMiTo`,
      description: "تیکت پشتیبانی خود را مشاهده و مدیریت کنید، نظرات اضافه کنید و پیشرفت حل مشکل را پیگیری کنید.",
      keywords: "تیکت پشتیبانی, میز کمک, خدمات مشتری, جزئیات تیکت"
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
    twitter: {
      card: "summary_large_image",
      title: currentMeta.title,
      description: currentMeta.description,
    },
  };
}

export default async function TicketDetailsPage({ params }) {
  const { locale, ticketId } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <TicketDetailsPageWrapper ticketId={ticketId} />;
}
