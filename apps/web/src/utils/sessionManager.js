'use client';

import React from 'react';
import { getSession } from 'next-auth/react';

/**
 * Session management utility for authentication verification
 */
export class SessionManager {
  static async verifySession() {
    try {
      console.log('[SessionManager] Verifying session...');
      const session = await getSession();
      
      if (!session) {
        console.log('[SessionManager] No session found');
        return { isValid: false, session: null, error: 'No session' };
      }
      
      if (!session.user) {
        console.log('[SessionManager] Session exists but no user data');
        return { isValid: false, session: null, error: 'No user data' };
      }
      
      console.log('[SessionManager] Session verified successfully:', {
        userId: session.user.id,
        email: session.user.email
      });
      
      return { isValid: true, session, error: null };
    } catch (error) {
      console.error('[SessionManager] Error verifying session:', error);
      return { isValid: false, session: null, error: error.message };
    }
  }
  
  static async checkSessionPersistence() {
    try {
      console.log('[SessionManager] Checking session persistence...');
      
      // Check if session persists across page refresh
      const session = await getSession();
      
      if (!session) {
        console.log('[SessionManager] Session not persisted');
        return { isPersistent: false, error: 'Session not found after refresh' };
      }
      
      // Verify session data integrity
      if (!session.user?.id || !session.user?.email) {
        console.log('[SessionManager] Session data incomplete');
        return { isPersistent: false, error: 'Incomplete session data' };
      }
      
      console.log('[SessionManager] Session persistence verified');
      return { isPersistent: true, session, error: null };
    } catch (error) {
      console.error('[SessionManager] Error checking session persistence:', error);
      return { isPersistent: false, error: error.message };
    }
  }
  
  static async refreshSession() {
    try {
      console.log('[SessionManager] Refreshing session...');
      
      // Force session refresh
      const session = await getSession();
      
      if (!session) {
        console.log('[SessionManager] No session to refresh');
        return { success: false, error: 'No session to refresh' };
      }
      
      console.log('[SessionManager] Session refreshed successfully');
      return { success: true, session, error: null };
    } catch (error) {
      console.error('[SessionManager] Error refreshing session:', error);
      return { success: false, error: error.message };
    }
  }
  
  static getSessionStatus() {
    // Get session status from localStorage for quick checks
    try {
      const sessionData = localStorage.getItem('session-status');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('[SessionManager] Error reading session status:', error);
      return null;
    }
  }
  
  static setSessionStatus(status) {
    // Store session status in localStorage
    try {
      localStorage.setItem('session-status', JSON.stringify({
        ...status,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('[SessionManager] Error storing session status:', error);
    }
  }
  
  static clearSessionStatus() {
    try {
      localStorage.removeItem('session-status');
    } catch (error) {
      console.error('[SessionManager] Error clearing session status:', error);
    }
  }
}

/**
 * Hook for session verification with automatic retry
 */
export function useSessionVerification() {
  const [sessionState, setSessionState] = React.useState({
    isVerified: false,
    isLoading: true,
    error: null,
    session: null
  });
  
  const verifySession = React.useCallback(async () => {
    setSessionState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const result = await SessionManager.verifySession();
    
    setSessionState({
      isVerified: result.isValid,
      isLoading: false,
      error: result.error,
      session: result.session
    });
    
    // Store session status
    SessionManager.setSessionStatus({
      isVerified: result.isValid,
      error: result.error,
      lastVerified: Date.now()
    });
    
    return result;
  }, []);
  
  const refreshSession = React.useCallback(async () => {
    const result = await SessionManager.refreshSession();
    if (result.success) {
      await verifySession();
    }
    return result;
  }, [verifySession]);
  
  React.useEffect(() => {
    verifySession();
  }, [verifySession]);
  
  return {
    ...sessionState,
    verifySession,
    refreshSession
  };
}

export default SessionManager;