"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AdminPageWrapperProps {
  children: React.ReactNode;
}

export default function AdminPageWrapper({ children }: AdminPageWrapperProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/profile/me');
      if (response.ok) {
        const user = await response.json();
        if (user.isAdmin) {
          setIsAdmin(true);
        } else {
          toast.error('Access denied. Admin privileges required.');
          router.push('/home');
        }
      } else {
        toast.error('Please log in to access admin panel.');
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      toast.error('Authentication failed.');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
} 