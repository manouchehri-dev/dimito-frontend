import { getTranslations } from 'next-intl/server';
import AuthCallbackHandler from '@/components/auth/AuthCallbackHandler';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return {
    title: `${t('loggingIn')} - DiMiTo`,
    description: 'Processing authentication...',
    robots: 'noindex, nofollow', // Don't index callback pages
  };
}

export default function AuthCallbackPage() {
  return <AuthCallbackHandler />;
}
