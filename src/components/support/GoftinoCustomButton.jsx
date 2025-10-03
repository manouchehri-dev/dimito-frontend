'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

/**
 * Custom Goftino Chat Button Component
 * Replaces default Goftino button with DiMiTo branded version
 */
export default function GoftinoCustomButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const t = useTranslations('goftino');
    const locale = useLocale();
    const isRTL = locale === 'fa';

    useEffect(() => {
        // Listen for Goftino events to sync state
        const handleOpenWidget = () => setIsOpen(true);
        const handleCloseWidget = () => setIsOpen(false);

        // Listen for new messages to update counter
        const handleGetMessage = () => {
            if (!isOpen) {
                setUnreadCount(prev => prev + 1);
            }
        };

        // Reset counter when widget opens
        const handleWidgetOpen = () => {
            setUnreadCount(0);
            setIsOpen(true);
        };

        window.addEventListener('goftino_openWidget', handleOpenWidget);
        window.addEventListener('goftino_closeWidget', handleCloseWidget);
        window.addEventListener('goftino_getMessage', handleGetMessage);
        window.addEventListener('goftino_openWidget', handleWidgetOpen);

        return () => {
            window.removeEventListener('goftino_openWidget', handleOpenWidget);
            window.removeEventListener('goftino_closeWidget', handleCloseWidget);
            window.removeEventListener('goftino_getMessage', handleGetMessage);
            window.removeEventListener('goftino_openWidget', handleWidgetOpen);
        };
    }, [isOpen]);

    const handleClick = () => {
        if (window.Goftino) {
            window.Goftino.toggle();
        }
    };

    return (
        <div className="relative">
            {/* Custom Chat Button */}
            <button
                onClick={handleClick}
                className="relative group bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-[#FF5D1B] focus:ring-offset-2"
                aria-label={t('openChat')}
                style={{ touchAction: 'manipulation' }}
            >
                {/* Icon */}
                <div className="relative">
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <MessageCircle className="w-6 h-6" />
                    )}

                    {/* Unread count badge */}
                    {unreadCount > 0 && !isOpen && (
                        <div
                            id="goftino-counter"
                            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center border-2 border-white"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                    )}
                </div>

                {/* Pulse animation for new messages */}
                {unreadCount > 0 && !isOpen && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] animate-ping opacity-75"></div>
                )}

                {/* Hover tooltip */}
                <div className={`absolute top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap ${isRTL ? 'right-full mr-2' : 'left-full ml-2'}`}>
                    {isOpen ? t('closeChat') : t('liveSupport')}
                    <div className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-transparent ${isRTL ? 'left-full border-l-4 border-l-gray-900' : 'right-full border-r-4 border-r-gray-900'}`}></div>
                </div>
            </button>

        </div>
    );
}
