// src/app/(protected)/layout.tsx
'use client';

import Sidebar from '../components/Sidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // This single useEffect hook now protects every page inside the (protected) group.
  useEffect(() => {
    const token = localStorage.getItem('arena-token');
    if (!token) {
      // If no token exists, redirect to the login page immediately.
      router.push('/');
    } else {
      // If a token is found, allow the content to be rendered.
      setIsAuthenticated(true);
    }
  }, [router]);

  // While checking for the token, we can show a loading state.
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <p className="text-white animate-pulse">Authenticating...</p>
      </div>
    );
  }

  // If authenticated, render the standard layout with the Sidebar.
  return (
    <section className="flex h-screen bg-gray-800 text-white">
      <Sidebar />
      <main className="flex-1 p-4 overflow-y-auto">
        {children}
      </main>
    </section>
  );
}
