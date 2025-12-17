'use client';

import React, { useState, Suspense } from 'react';
import useAuth from '../../../src/utils/useAuth';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SignInFormContent() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const searchParams = useSearchParams();

  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors when starting new attempt
    setError(null);
    setLoading(true);

    // Client-side validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      console.log('[SignIn] Attempting signin with:', { email });
      
      const result = await signInWithCredentials({
        email: email.trim(),
        password,
        callbackUrl: searchParams?.get('callbackUrl') || '/workspace',
      });
      
      console.log('[SignIn] SignIn completed successfully, result:', result);
      // The redirect should happen automatically via NextAuth
      
    } catch (err: any) {
      console.error('[SignIn] SignIn error:', err);
      
      // Use the error message from useAuth hook which has better error mapping
      setError(err.message || 'An unexpected error occurred. Please try again.');
      
      // Don't clear form fields on error - preserve user input
      // Only clear password for security on credential errors
      if (err.type === 'CredentialsSignin') {
        setPassword('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F4F0] to-[#ECEAE7] dark:from-[#1A1A1A] dark:to-[#0F0F0F] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img
              src="https://www.create.xyz/images/logoipsum/224"
              alt="Logo"
              className="h-10 w-10"
            />
            <span className="text-[#121212] dark:text-white text-xl font-semibold font-sans">
              DesignCraft
            </span>
          </div>
          <p className="text-[#555555] dark:text-[#C0C0C0] text-base">
            Transform screenshots into stunning designs
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-8 shadow-lg border border-[#E0E0E0] dark:border-[#404040] font-sans"
        >
          <h1 className="text-2xl font-semibold text-[#121212] dark:text-white text-center mb-8">
            Welcome Back
          </h1>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#555555] dark:text-[#C0C0C0]">
                Email
              </label>
              <input
                required
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  // Clear error when user starts typing
                  if (error) setError(null);
                }}
                placeholder="Enter your email"
                disabled={loading}
                className="w-full px-4 py-3 bg-[#FAF9F7] dark:bg-[#262626] border border-[#E0E0E0] dark:border-[#404040] rounded-2xl text-[#121212] dark:text-white placeholder-[#999999] dark:placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:border-transparent transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#555555] dark:text-[#C0C0C0]">
                Password
              </label>
              <input
                required
                name="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  // Clear error when user starts typing
                  if (error) setError(null);
                }}
                placeholder="Enter your password"
                disabled={loading}
                className="w-full px-4 py-3 bg-[#FAF9F7] dark:bg-[#262626] border border-[#E0E0E0] dark:border-[#404040] rounded-2xl text-[#121212] dark:text-white placeholder-[#999999] dark:placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:border-transparent transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 px-6 bg-gradient-to-t from-[#8B70F6] to-[#9D7DFF] hover:from-[#7E64F2] hover:to-[#8B70F6] disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-2xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-[#666666] dark:text-[#AAAAAA]">
                Don't have an account?{' '}
                <Link
                  href={`/account/signup${searchParams ? `?${searchParams.toString()}` : ''}`}
                  className="text-[#8B70F6] hover:text-[#7E64F2] font-medium transition-colors duration-150"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SignInClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#F5F4F0] to-[#ECEAE7] dark:from-[#1A1A1A] dark:to-[#0F0F0F] flex items-center justify-center">
          <div className="text-[#555555] dark:text-[#C0C0C0]">Loading...</div>
        </div>
      }
    >
      <SignInFormContent />
    </Suspense>
  );
}
