'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initAnalytics, trackEvent } from '@/lib/analytics';
import { AuthTracker } from './AuthTracker';

function AnalyticsPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (!pathname) return;

    const fullPath = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    if (lastTrackedPathRef.current === fullPath) return;
    lastTrackedPathRef.current = fullPath;

    if (pathname === '/') {
      trackEvent('landing_page_viewed');
    } else if (pathname === '/login') {
      trackEvent('login_page_viewed');
    } else if (pathname.startsWith('/dashboard')) {
      trackEvent('dashboard_viewed', { path: pathname });
    } else if (pathname === '/session/setup') {
      trackEvent('session_setup_viewed');
    } else if (pathname === '/growth') {
      trackEvent('growth_viewed');
    } else if (pathname.startsWith('/history')) {
      trackEvent('history_viewed', { path: pathname });
    } else if (pathname === '/guide') {
      trackEvent('guide_viewed');
    } else if (pathname === '/settings') {
      trackEvent('settings_viewed');
    } else {
      trackEvent('page_viewed', { path: pathname });
    }
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <>
      <AuthTracker />
      <Suspense fallback={null}>
        <AnalyticsPageViewTracker />
      </Suspense>
      {children}
    </>
  );
}
