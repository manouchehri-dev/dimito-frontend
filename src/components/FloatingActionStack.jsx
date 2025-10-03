'use client';

import { useLocale } from 'next-intl';
import GlobeLanguageToggle from './GlobeLanguageToggle';

/**
 * Unified Floating Action Stack
 * Groups related actions together for better UX
 */
export default function FloatingActionStack() {
    const locale = useLocale();
    const isRTL = locale === 'fa';

    return (
        <>
            {/* Left Side Stack - Language Switcher above Presale Button */}
            <div className="fixed bottom-6 left-6 z-50">
                <div className="flex flex-col items-center gap-4">
                    {/* Language Switcher - Top of stack */}
                    <div className="relative z-[60]">
                        <GlobeLanguageToggle position="compact" className="shadow-lg" />
                    </div>
                    
                    {/* Space reserved for FloatingPresaleButton when active */}
                    {/* FloatingPresaleButton will position itself here */}
                </div>
            </div>

            {/* Right side reserved for Goftino chat widget (auto-positioned) */}
        </>
    );
}
