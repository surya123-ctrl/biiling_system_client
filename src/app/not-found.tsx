'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Log for debugging or analytics
    console.warn('⚠️ 404 - Page not found');
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-md mx-auto">
        {/* Error code with animation */}
        <div className="relative mb-8">
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600 drop-shadow-sm animate-bounce">
            404
          </h1>
          <div className="absolute inset-0 text-8xl font-black text-red-200 -z-10 blur-sm">
            404
          </div>
        </div>

        {/* Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>

        {/* Title and description */}
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-2 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Don't worry, it happens to the best of us!
        </p>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 transition-all duration-200 ease-out"
          >
            ← Go Back
          </button>
          
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 transform hover:scale-105 transition-all duration-200 ease-out"
          >
            🏠 Back to Home
          </Link>

          <Link
            href="/admin/login"
            className="block w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-lg shadow-lg hover:from-gray-700 hover:to-gray-800 transform hover:scale-105 transition-all duration-200 ease-out"
          >
            👤 Admin Login
          </Link>
        </div>

        {/* Help text */}
        <p className="text-xs text-gray-400 mt-8">
          Still having trouble? <a href="/contact" className="text-purple-600 hover:text-purple-700 underline">Contact support</a>
        </p>
      </div>

      {/* Floating animation elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-purple-300 rounded-full animate-float opacity-60"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-red-300 rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-20 left-20 w-5 h-5 bg-purple-400 rounded-full animate-float opacity-50" style={{animationDelay: '2s'}}></div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}