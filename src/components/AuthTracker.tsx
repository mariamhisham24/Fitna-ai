'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { initAnalytics, identifyUser, resetUser, trackEvent } from '@/lib/analytics';

export function AuthTracker() {
  const isIdentifiedRef = useRef(false);

  useEffect(() => {
    initAnalytics();
    const supabase = createClient();

    const processPendingAuthEvents = (userRole?: string) => {
      try {
        if (typeof window === 'undefined') return;
        const pendingLogin = sessionStorage.getItem('fitna_pending_login');
        if (pendingLogin) {
          sessionStorage.removeItem('fitna_pending_login');
          trackEvent('user_logged_in', {
            login_method: pendingLogin,
            role: userRole || 'teacher',
          });
        }

        const pendingSignup = sessionStorage.getItem('fitna_pending_signup');
        if (pendingSignup) {
          sessionStorage.removeItem('fitna_pending_signup');
          const data = JSON.parse(pendingSignup);
          trackEvent('user_signed_up', {
            role: data.role || userRole || 'teacher',
            nationality: data.nationality,
            signup_method: data.signup_method || 'email_password',
          });
        }
      } catch {
        // Safe non-blocking
      }
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && !isIdentifiedRef.current) {
        isIdentifiedRef.current = true;
        const role = user.user_metadata?.role || 'teacher';
        identifyUser(user.id, {
          role,
          market: user.user_metadata?.market,
          full_name: user.user_metadata?.full_name,
        });
        processPendingAuthEvents(role);
      } else if (!user) {
        isIdentifiedRef.current = false;
        resetUser();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        isIdentifiedRef.current = true;
        const role = session.user.user_metadata?.role || 'teacher';
        identifyUser(session.user.id, {
          role,
          market: session.user.user_metadata?.market,
          full_name: session.user.user_metadata?.full_name,
        });
        processPendingAuthEvents(role);
      } else if (event === 'SIGNED_OUT') {
        isIdentifiedRef.current = false;
        resetUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
