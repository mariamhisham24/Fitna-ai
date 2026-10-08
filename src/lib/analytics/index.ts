/**
 * Fitna AI PostHog Analytics Client SDK
 * Production-ready, non-blocking, privacy-preserving tracking wrapper.
 */

import posthog from 'posthog-js';
import type { FitnaAnalyticsEvent, AnalyticsLanguage, BaseEventProperties } from './types';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let isInitialized = false;

export function initAnalytics(): void {
  if (typeof window === 'undefined' || isInitialized) return;

  if (!POSTHOG_KEY) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[Analytics Debug] PostHog key not defined; analytics disabled.');
    }
    return;
  }

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: true,
      disable_session_recording: true,
      request_batching: false,
      opt_out_useragent_filter: true,
      debug: process.env.NODE_ENV !== 'production',
      loaded: () => {
        console.log('[Analytics Debug] PostHog initialized');
      },
    });
    isInitialized = true;
    console.log('[Analytics Debug] PostHog client ready');
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Analytics Debug] PostHog init failed gracefully:', err);
    }
  }
}

if (typeof window !== 'undefined') {
  (window as unknown as { posthog: typeof posthog }).posthog = posthog;
  initAnalytics();
}

export function getClientAnalyticsContext(): {
  language: AnalyticsLanguage;
  interface_language: 'ar' | 'en';
  market: 'eg' | 'sa';
} {
  if (typeof document === 'undefined') {
    return { language: 'ar-EG', interface_language: 'ar', market: 'eg' };
  }

  const langMatch = document.cookie.match(/(?:^|;\s*)language=(ar|en)(?:;|$)/);
  const interfaceLang = (langMatch && langMatch[1] === 'en' ? 'en' : 'ar') as 'ar' | 'en';

  const marketMatch = document.cookie.match(/(?:^|;\s*)fitna_market=(eg|sa)(?:;|$)/);
  const market = (marketMatch && marketMatch[1] === 'sa' ? 'sa' : 'eg') as 'eg' | 'sa';

  const language: AnalyticsLanguage = interfaceLang === 'en' ? 'en' : market === 'sa' ? 'ar-SA' : 'ar-EG';

  return {
    language,
    interface_language: interfaceLang,
    market,
  };
}

export function identifyUser(
  userId: string,
  properties?: {
    email?: string;
    role?: string;
    market?: 'eg' | 'sa';
    full_name?: string;
    [key: string]: unknown;
  }
): void {
  if (typeof window === 'undefined' || !userId || !POSTHOG_KEY) return;
  if (!isInitialized) initAnalytics();

  try {
    const context = getClientAnalyticsContext();
    const userProperties: Record<string, unknown> = {
      market: properties?.market || context.market,
      language: context.language,
      interface_language: context.interface_language,
      ...properties,
    };

    Object.keys(userProperties).forEach((key) => {
      if (userProperties[key] === undefined) delete userProperties[key];
    });

    console.log('[Analytics Debug] identifyUser called, role:', properties?.role || 'teacher', 'market:', properties?.market || context.market);
    posthog.identify(userId, userProperties);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Analytics Debug] identifyUser error:', err);
    }
  }
}

export function setUserProperties(properties: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return;
  if (!isInitialized) initAnalytics();

  try {
    posthog.people.set(properties);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Analytics Debug] setUserProperties error:', err);
    }
  }
}

export function resetUser(): void {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return;
  if (!isInitialized) initAnalytics();

  try {
    console.log('[Analytics Debug] resetUser called');
    posthog.reset();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Analytics Debug] resetUser error:', err);
    }
  }
}

export function trackEvent<T extends BaseEventProperties = BaseEventProperties>(
  eventName: FitnaAnalyticsEvent,
  properties?: T,
  options?: { send_instantly?: boolean; transport?: 'XHR' | 'sendBeacon' }
): void {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return;
  if (!isInitialized) initAnalytics();

  try {
    const context = getClientAnalyticsContext();
    const payload = {
      language: properties?.language || context.language,
      interface_language: properties?.interface_language || context.interface_language,
      market: properties?.market || context.market,
      timestamp: new Date().toISOString(),
      ...properties,
    };

    console.log('[Analytics Debug] trackEvent called:', eventName);
    if (eventName === 'user_logged_in') {
      console.log('[Analytics Debug] user_logged_in called, method:', properties?.login_method);
    }
    if (eventName === 'dashboard_viewed') {
      console.log('[Analytics Debug] dashboard_viewed called');
    }

    posthog.capture(eventName, payload, options);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Analytics Debug] trackEvent (' + eventName + ') error:', err);
    }
  }
}

export function trackPageview(pathname: string): void {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return;
  if (!isInitialized) initAnalytics();

  try {
    const context = getClientAnalyticsContext();
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      path: pathname,
      market: context.market,
      language: context.language,
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Analytics Debug] trackPageview error:', err);
    }
  }
}
