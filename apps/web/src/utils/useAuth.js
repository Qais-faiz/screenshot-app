'use client';

import { useCallback } from 'react';
import { signIn, signOut } from "next-auth/react";

// Error type mapping for better user experience
const getErrorMessage = (error) => {
  const errorMessages = {
    'CredentialsSignin': 'Invalid email or password. Please try again.',
    'EmailCreateAccount': 'This email is already registered or invalid. Please try a different email or sign in instead.',
    'OAuthSignin': "Couldn't start sign-in. Please try again or use a different method.",
    'OAuthCallback': 'Sign-in failed after redirecting. Please try again.',
    'OAuthCreateAccount': "Couldn't create an account with this sign-in method. Try another option.",
    'Callback': 'Something went wrong during sign-in. Please try again.',
    'OAuthAccountNotLinked': 'This account is linked to a different sign-in method. Try using that instead.',
    'AccessDenied': "You don't have permission to sign in.",
    'Configuration': "Sign-in isn't working right now. Please try again later.",
    'Verification': 'Your sign-in link has expired. Request a new one.',
    'Default': 'An unexpected error occurred. Please try again.'
  };
  
  return errorMessages[error] || errorMessages['Default'];
};

function useAuth() {
  const callbackUrl = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('callbackUrl')
    : null;

  const signInWithCredentials = useCallback(async (options) => {
    try {
      console.log('[useAuth] Starting signIn with options:', { 
        email: options.email, 
        callbackUrl: options.callbackUrl 
      });
      
      // Use NextAuth's signIn with redirect: false to handle errors properly
      const result = await signIn("credentials-signin", {
        email: options.email,
        password: options.password,
        callbackUrl: options.callbackUrl || callbackUrl || '/workspace',
        redirect: false,
      });
      
      console.log('[useAuth] SignIn result:', { ok: result?.ok, error: result?.error, url: result?.url });
      
      if (result?.error) {
        console.error('[useAuth] SignIn failed with error:', result.error);
        const errorMessage = getErrorMessage(result.error);
        const error = new Error(errorMessage);
        error.type = result.error;
        throw error;
      }
      
      if (result?.ok && result?.url) {
        console.log('[useAuth] SignIn successful, redirecting to:', result.url);
        // Use NextAuth's provided redirect URL for successful authentication
        window.location.href = result.url;
        return result;
      }
      
      // If we get here, something unexpected happened
      console.warn('[useAuth] Unexpected signIn result:', result);
      const error = new Error('Sign in failed - unexpected response');
      error.type = 'Default';
      throw error;
      
    } catch (error) {
      console.error('[useAuth] SignIn error:', error);
      
      // If it's already our custom error, re-throw it
      if (error.type) {
        throw error;
      }
      
      // For network or other errors, create a generic error
      const networkError = new Error('Connection problem. Please check your internet and try again.');
      networkError.type = 'Network';
      throw networkError;
    }
  }, [callbackUrl]);

  const signUpWithCredentials = useCallback(async (options) => {
    try {
      console.log('[useAuth] Starting signUp with options:', { 
        email: options.email, 
        name: options.name,
        callbackUrl: options.callbackUrl 
      });
      
      // Use NextAuth's signIn with redirect: false to handle errors properly
      const result = await signIn("credentials-signup", {
        email: options.email,
        password: options.password,
        name: options.name,
        callbackUrl: options.callbackUrl || callbackUrl || '/workspace',
        redirect: false,
      });
      
      console.log('[useAuth] SignUp result:', { ok: result?.ok, error: result?.error, url: result?.url });
      
      if (result?.error) {
        console.error('[useAuth] SignUp failed with error:', result.error);
        const errorMessage = getErrorMessage(result.error);
        const error = new Error(errorMessage);
        error.type = result.error;
        throw error;
      }
      
      if (result?.ok && result?.url) {
        console.log('[useAuth] SignUp successful, redirecting to:', result.url);
        // Use NextAuth's provided redirect URL for successful registration
        window.location.href = result.url;
        return result;
      }
      
      // If we get here, something unexpected happened
      console.warn('[useAuth] Unexpected signUp result:', result);
      const error = new Error('Account creation failed - unexpected response');
      error.type = 'Default';
      throw error;
      
    } catch (error) {
      console.error('[useAuth] SignUp error:', error);
      
      // If it's already our custom error, re-throw it
      if (error.type) {
        throw error;
      }
      
      // For network or other errors, create a generic error
      const networkError = new Error('Connection problem. Please check your internet and try again.');
      networkError.type = 'Network';
      throw networkError;
    }
  }, [callbackUrl]);

  const signInWithGoogle = useCallback((options) => {
    return signIn("google", {
      ...options,
      callbackUrl: callbackUrl ?? options.callbackUrl
    });
  }, [callbackUrl]);
  const signInWithFacebook = useCallback((options) => {
    return signIn("facebook", options);
  }, []);
  const signInWithTwitter = useCallback((options) => {
    return signIn("twitter", options);
  }, []);

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signOut,
  }
}

export default useAuth;