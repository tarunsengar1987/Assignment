'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { meService } from '@/services/me.service';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // If we don't have an access token, we might still have a refresh token (HttpOnly)
      // The apiFetch will handle the refresh if /me returns 401
      if (!isAuthenticated()) {
        try {
          // Attempt to get info which might trigger a silent refresh
          await meService.getMyInfo();
        } catch (err) {
          // If the fetch fails and we're still not authenticated, redirect
          if (!isAuthenticated()) {
            router.replace('/auth/signin');
          }
        }
      }
    };

    checkAuth();
  }, [router]);

  return <>{children}</>;
}