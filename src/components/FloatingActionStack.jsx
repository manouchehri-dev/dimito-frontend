'use client';

import { useLocale } from 'next-intl';
import GlobeLanguageToggle from './GlobeLanguageToggle';
import GoftinoCustomButton from './support/GoftinoCustomButton';

/**
 * Unified Floating Action Stack
 * Groups related actions together for better UX
 */
export default function FloatingActionStack() {
    const locale = useLocale();
    const isRTL = locale === 'fa';

    return (
        <>
            {/* Right Side Action Stack - Chat + Language Switcher */}
            <div className={`fixed bottom-6 z-50 ${isRTL ? 'right-6' : 'left-6'}`}>
                <div className="flex flex-col items-center gap-4">
                    {/* Language Switcher - Above Chat Button */}
                    <div className="relative z-[60]">
                        <GlobeLanguageToggle position="compact" className="shadow-lg" />
                    </div>

                    {/* Chat Button - Main Action */}
                    <div className="relative z-[55]">
                        <GoftinoCustomButton />
                    </div>
                </div>
            </div>

            {/* Left Side - Reserved for Presale Button */}
            {/* FloatingPresaleButton will use left side when active */}
        </>
    );
}
