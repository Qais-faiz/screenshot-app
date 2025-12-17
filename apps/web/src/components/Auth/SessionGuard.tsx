'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SessionManager } from '../../utils/sessionManager';

interface SessionGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function SessionGuard({ 
  children, 
  redirectTo = '/account/signin',
  fallback 
}: SessionGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessionState, setSessionState] = useState({
    isVerified: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const verifySession = async () => {
      console.log('[SessionGuard] Verifying session, status:', status);
      
      if (status === 'loading') {
        return; // Still loading, wait
      }
      
      if (status === 'unauthenticated') {
        console.log('[SessionGuard] No session, redirecting to:', redirectTo);
        router.push(redirectTo);
        return;
      }
      
      if (status === 'authenticated' && session) {
        console.log('[SessionGuard] Session found, verifying...');
        
        const verification = await SessionManager.verifySession();
        
        if (verification.isValid) {
          console.log('[SessionGuard] Session verified successfully');
          setSessionState({
            isVerified: true,
            isLoading: false,
            error: null
          });
        } else {
          console.error('[SessionGuard] Session verification failed:', verification.error);
          setSessionState({
            isVerified: false,
            isLoading: false,
            error: verification.error
          });
          
          // Redirect to sign-in if session is invalid
          router.push(redirectTo);
        }
      }
    };

    verifySession();
  }, [session, status, router, redirectTo]);

  // Show loading state
  if (status === 'loading' || sessionState.isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (sessionState.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 dark:text-gray-400">Session verification failed</p>
          <p className="text-sm text-gray-500 mt-2">{sessionState.error}</p>
          <button 
            onClick={() => router.push(redirectTo)}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Sign In Again
          </button>
        </div>
      </div>
    );
  }

  // Show children if session is verified
  if (sessionState.isVerified) {
    return <>{children}</>;
  }

  // Fallback - should not reach here
  return null;
}

export default SessionGuard;