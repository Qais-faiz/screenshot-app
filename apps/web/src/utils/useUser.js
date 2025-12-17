'use client';

import * as React from 'react';
import { useSession } from "next-auth/react";
import { SessionManager } from './sessionManager';

const useUser = () => {
  const { data: session, status } = useSession();
  const id = session?.user?.id;

  const [user, setUser] = React.useState(session?.user ?? null);
  const [sessionVerified, setSessionVerified] = React.useState(false);
  const [sessionError, setSessionError] = React.useState(null);

  const fetchUser = React.useCallback(async (session) => {
    return session?.user;
  }, []);

  const verifyAndSetSession = React.useCallback(async () => {
    if (session?.user) {
      console.log('[useUser] Verifying session for user:', session.user.email);
      
      const verification = await SessionManager.verifySession();
      
      if (verification.isValid) {
        setUser(session.user);
        setSessionVerified(true);
        setSessionError(null);
        console.log('[useUser] Session verified successfully');
      } else {
        console.error('[useUser] Session verification failed:', verification.error);
        setUser(null);
        setSessionVerified(false);
        setSessionError(verification.error);
      }
    } else {
      setUser(null);
      setSessionVerified(false);
      setSessionError(null);
    }
  }, [session]);

  const refetchUser = React.useCallback(() => {
    if (process.env.NEXT_PUBLIC_CREATE_ENV === "PRODUCTION") {
      if (id) {
        fetchUser(session).then(setUser);
      } else {
        setUser(null);
      }
    } else {
      // In development, also verify session
      verifyAndSetSession();
    }
  }, [fetchUser, id, session, verifyAndSetSession]);

  // Verify session when it changes
  React.useEffect(() => {
    if (status === 'authenticated' && session) {
      verifyAndSetSession();
    } else if (status === 'unauthenticated') {
      setUser(null);
      setSessionVerified(false);
      setSessionError(null);
      SessionManager.clearSessionStatus();
    }
  }, [session, status, verifyAndSetSession]);

  // Check session persistence on mount
  React.useEffect(() => {
    const checkPersistence = async () => {
      if (status === 'authenticated' && session) {
        const persistence = await SessionManager.checkSessionPersistence();
        if (!persistence.isPersistent) {
          console.warn('[useUser] Session persistence issue:', persistence.error);
          setSessionError(persistence.error);
        }
      }
    };
    
    checkPersistence();
  }, [session, status]);

  const isLoading = status === 'loading' || (status === 'authenticated' && !sessionVerified && !sessionError);

  if (process.env.NEXT_PUBLIC_CREATE_ENV !== "PRODUCTION") {
    return { 
      user, 
      data: session?.user || null, 
      loading: isLoading, 
      refetch: refetchUser,
      sessionVerified,
      sessionError
    };
  }
  
  return { 
    user, 
    data: user, 
    loading: isLoading, 
    refetch: refetchUser,
    sessionVerified,
    sessionError
  };
};

export { useUser }

export default useUser;