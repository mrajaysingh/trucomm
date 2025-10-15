'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin login page
    router.replace('/admin/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex items-center space-x-2 text-white">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        <span>Redirecting to admin login...</span>
      </div>
    </div>
  );
}
