'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getDemoUser } from '@/lib/storage';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      // 1. Check Supabase session
      const supabase = createClient();
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setIsAuthenticated(true);
            return;
          }
        } catch (err) {
          console.warn('Supabase session check error:', err);
        }
      }

      // 2. Check Demo User session in storage
      const demoUser = getDemoUser();
      if (demoUser) {
        setIsAuthenticated(true);
        return;
      }

      // 3. If unauthenticated, redirect to login
      setIsAuthenticated(false);
      router.push('/login');
    }

    checkAuth();
  }, [router, pathname]);

  // Show loading spinner while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400">Verifying session...</p>
      </div>
    );
  }

  // If unauthenticated, render nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
