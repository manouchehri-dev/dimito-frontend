'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAuthStore } from '@/lib/auth/authStore';
import { useLocale } from 'next-intl';

/**
 * Goftino Live Chat Integration
 * Customized for DiMiTo branding with user context
 */
export default function GoftinoChat() {
    const { address, isConnected } = useAccount();
    const { user, isAuthenticated } = useAuthStore();
    const locale = useLocale();

    useEffect(() => {
        // Wait for Goftino to be ready
        const handleGoftinoReady = () => {
            console.log('🎯 Goftino Chat Ready - Initializing DiMiTo customization');

            // Set user information if authenticated
            if (isAuthenticated && user) {
                try {
                    window.Goftino.setUser({
                        email: user.email || '',
                        name: user.display_name || user.first_name || 'DiMiTo User',
                        phone: user.phone || '',
                        avatar: user.avatar || '',
                        tags: [
                            'dimito-user',
                            isConnected ? 'wallet-connected' : 'wallet-disconnected',
                            user.is_verified ? 'verified' : 'unverified',
                            locale === 'fa' ? 'farsi' : 'english'
                        ].join(','),
                        metadata: [
                            { key: 'user-id', value: user.id?.toString() || '' },
                            { key: 'wallet-address', value: address || 'not-connected' },
                            { key: 'language', value: locale },
                            { key: 'auth-method', value: user.auth_method || 'unknown' }
                        ],
                        forceUpdate: true
                    });
                    console.log('✅ User data sent to Goftino');
                } catch (error) {
                    console.error('❌ Error setting Goftino user:', error);
                }
            }

            // Customize widget appearance for DiMiTo branding
            try {
                window.Goftino.setWidget({
                    // Position settings
                    marginBottom: 20,
                    marginRight: locale === 'fa' ? 0 : 20,
                    marginLeft: locale === 'fa' ? 20 : 0,

                    // Display settings
                    hasIcon: false,     // Hide default icon (we'll use custom button)
                    hasSound: true,     // Enable notification sounds

                    // Custom CSS for DiMiTo branding
                    cssUrl: '/goftino-custom.css',

                    // Custom icon (optional - you can add your own)
                    // iconUrl: '/images/dimito-chat-icon.png',

                    // Show unread count on custom element if exists
                    counter: '#goftino-counter',

                    // Filter spam words (optional)
                    filterWords: 'spam,advertisement,promotion'
                });
                console.log('✅ Goftino widget customized for DiMiTo');
            } catch (error) {
                console.error('❌ Error customizing Goftino widget:', error);
            }
        };

        // Track when user sends messages
        const handleSendMessage = (event) => {
            const messageType = event.detail?.type;
            const messageContent = event.detail?.content;

            console.log('📤 User sent message:', {
                type: messageType,
                content: messageContent
            });

            // You can track analytics here
            if (window.gtag) {
                window.gtag('event', 'chat_message_sent', {
                    message_type: messageType,
                    user_authenticated: isAuthenticated
                });
            }
        };

        // Track when operators send messages
        const handleGetMessage = (event) => {
            const messageType = event.detail?.type;
            const messageContent = event.detail?.content;

            console.log('📥 Received message:', {
                type: messageType,
                content: messageContent
            });

            // You can trigger notifications here
            if (window.gtag) {
                window.gtag('event', 'chat_message_received', {
                    message_type: messageType
                });
            }
        };

        // Track widget open/close
        const handleOpenWidget = () => {
            console.log('💬 Chat opened');
            if (window.gtag) {
                window.gtag('event', 'chat_opened');
            }
        };

        const handleCloseWidget = () => {
            console.log('❌ Chat closed');
            if (window.gtag) {
                window.gtag('event', 'chat_closed');
            }
        };

        // Add event listeners
        window.addEventListener('goftino_ready', handleGoftinoReady);
        window.addEventListener('goftino_sendMessage', handleSendMessage);
        window.addEventListener('goftino_getMessage', handleGetMessage);
        window.addEventListener('goftino_openWidget', handleOpenWidget);
        window.addEventListener('goftino_closeWidget', handleCloseWidget);

        // Cleanup
        return () => {
            window.removeEventListener('goftino_ready', handleGoftinoReady);
            window.removeEventListener('goftino_sendMessage', handleSendMessage);
            window.removeEventListener('goftino_getMessage', handleGetMessage);
            window.removeEventListener('goftino_openWidget', handleOpenWidget);
            window.removeEventListener('goftino_closeWidget', handleCloseWidget);
        };
    }, [address, isConnected, isAuthenticated, user, locale]);

    // This component doesn't render anything
    return null;
}
