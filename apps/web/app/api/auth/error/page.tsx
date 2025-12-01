'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification token has expired or has already been used.',
    Default: 'An error occurred during authentication.',
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

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
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-8 shadow-lg border border-[#E0E0E0] dark:border-[#404040] font-sans">
          <h1 className="text-2xl font-semibold text-[#121212] dark:text-white text-center mb-4">
            Authentication Error
          </h1>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              {errorMessage}
            </p>
            {error && (
              <p className="text-xs text-red-500 dark:text-red-500 text-center mt-2">
                Error code: {error}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <Link
              href="/account/signin"
              className="block w-full py-3 px-6 bg-gradient-to-t from-[#8B70F6] to-[#9D7DFF] hover:from-[#7E64F2] hover:to-[#8B70F6] text-white font-semibold rounded-2xl transition-all duration-150 text-center focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2"
            >
              Try Again
            </Link>

            <Link
              href="/"
              className="block w-full py-3 px-6 bg-white dark:bg-[#262626] border border-[#E0E0E0] dark:border-[#404040] text-[#121212] dark:text-white font-semibold rounded-2xl hover:bg-[#FAF9F7] dark:hover:bg-[#333333] transition-all duration-150 text-center focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#F5F4F0] to-[#ECEAE7] dark:from-[#1A1A1A] dark:to-[#0F0F0F] flex items-center justify-center">
          <div className="text-[#555555] dark:text-[#C0C0C0]">Loading...</div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
