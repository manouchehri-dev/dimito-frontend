import React from "react";
import { setRequestLocale } from "next-intl/server";
import CreateDMTPage from "@/components/CreateDMTPage";

export default async function CreateDMTPageRoute({ params }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <CreateDMTPage />;
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return {
    title: locale === "fa" ? "ایجاد توکن DMT" : "Create DMT Token",
    description:
      locale === "fa"
        ? "توکن معدنی دیجیتال جدید ایجاد کنید"
        : "Create a new Digital Mine Token",
  };
}
