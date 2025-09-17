import { setRequestLocale } from "next-intl/server";
import UnifiedLoginPage from "@/components/auth/UnifiedLoginPage";

export default async function LoginPage({ params, searchParams }) {
  const { locale } = await params;
  const { redirect } = await searchParams;

  // Enable static rendering
  setRequestLocale(locale);

  return <UnifiedLoginPage redirectTo={redirect} />;
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return {
    title: locale === "fa" ? "ورود به سیستم" : "Login",
    description:
      locale === "fa" ? "وارد حساب کاربری خود شوید" : "Sign in to your account",
  };
}
