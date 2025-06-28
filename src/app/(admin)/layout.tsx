// src/app/(admin)/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './components/AdminSidebar';
import { jwtDecode } from 'jwt-decode'; // We'll need a library to decode the token

// Define a type for our JWT payload
interface JwtPayload {
  user: {
    id: number;
    email: string;
    is_admin: boolean;
  };
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('arena-token');
    if (!token) {
      router.push('/'); // No token, redirect to login
      return;
    }
    
    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      if (decodedToken.user && decodedToken.user.is_admin) {
        setIsAdmin(true); // User is an admin, allow access
      } else {
        router.push('/dashboard'); // User is not an admin, redirect to regular dashboard
      }
    } catch (error) {
      console.error("Invalid token:", error);
      router.push('/'); // Invalid token, redirect to login
    }
  }, [router]);

  // While checking, we can show a loading state
  if (!isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <p className="text-white animate-pulse">Verifying administrative access...</p>
      </div>
    );
  }

  // If check passes, render the admin layout
  return (
    <section className="flex h-screen bg-gray-800 text-white">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </section>
  );
}
