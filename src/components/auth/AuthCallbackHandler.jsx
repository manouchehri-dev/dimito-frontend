'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import useAuthStore from '@/stores/useAuthStore';

export default function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const { loginWithSSO } = useAuthStore();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const token = searchParams.get('token');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        // Check for user data in URL parameters
        const userDataParam = searchParams.get('user');
        console.log('URL parameters:', { token, error, userDataParam });

        if (error) {
          // Handle authentication error
          setStatus('error');
          setMessage(errorDescription || t('authenticationFailed'));
          
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
          return;
        }

        if (token) {
          try {
            // Decode JWT token to check expiration
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Check if token is expired
            if (payload.exp * 1000 <= Date.now()) {
              throw new Error('Token expired');
            }
            
            let userData;
            
            // Try to get user data from URL parameters first
            if (userDataParam) {
              try {
                userData = JSON.parse(decodeURIComponent(userDataParam));
                console.log('User data from URL:', userData);
              } catch (parseError) {
                console.error('Error parsing user data from URL:', parseError);
                userData = null;
              }
            }
            
            // Fallback to JWT payload if no URL user data
            if (!userData) {
              userData = {
                id: payload.user_id || payload.id,
                username: payload.username || '',
                email: payload.email || '',
                first_name: payload.first_name || '',
                last_name: payload.last_name || '',
                phone_number: payload.phone_number || null
              };
              console.log('User data from JWT payload:', userData);
            }
            
            // Update authentication state with complete user data
            loginWithSSO(token, userData);
            
            setStatus('success');
            setMessage(t('authenticationSuccess'));
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          } catch (tokenError) {
            console.error('Error processing token:', tokenError);
            setStatus('error');
            setMessage(t('authenticationFailed'));
            
            setTimeout(() => {
              router.push('/auth/login');
            }, 3000);
          }
        } else {
          // No token received
          setStatus('error');
          setMessage(t('authenticationFailed'));
          
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(t('authenticationFailed'));
        
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {status === 'processing' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-6">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {t('loggingIn')}
              </h1>
              <p className="text-gray-600">
                Processing your authentication...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {t('authenticationSuccess')}
              </h1>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <div className="text-sm text-gray-500">
                Redirecting to dashboard...
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {t('authenticationFailed')}
              </h1>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <div className="text-sm text-gray-500">
                Redirecting to login page...
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
