'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">Error</h1>
        <p className="text-xl text-gray-300 mb-8">Something went wrong</p>
        <button
          onClick={reset}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors mr-4"
        >
          Try again
        </button>
        <a
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
