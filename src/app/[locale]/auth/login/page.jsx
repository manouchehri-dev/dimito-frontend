import { getTranslations } from 'next-intl/server';
import ModernLoginPage from '@/components/auth/ModernLoginPage';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'auth' });

    return {
        title: `${t('welcomeBack')} - DiMiTo`,
        description: t('loginToAccess'),
        openGraph: {
            title: `${t('welcomeBack')} - DiMiTo`,
            description: t('loginToAccess'),
            type: 'website',
        },
        twitter: {
            card: 'summary',
            title: `${t('welcomeBack')} - DiMiTo`,
            description: t('loginToAccess'),
        },
    };
}

export default async function LoginPage({ searchParams }) {
    const redirectTo = (await searchParams)?.redirectTo ?? null;
    return <ModernLoginPage redirectTo={redirectTo} />;
}
