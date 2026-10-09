import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Script from 'next/script';
import { I18nProvider } from '@/lib/i18n/context';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { ChatBotProvider } from '@/components/ChatBot/ChatBotProvider';
import { ChatBot } from '@/components/ChatBot/ChatBot';
import type { Language } from '@/lib/i18n/types';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fitna AI | محاكاة',
  description: 'اتقن إدارة الفصل قبل أن تدخله - AI-Powered Classroom Simulation',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo/fitna-icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/logo/fitna-icon.png',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value === 'dark' ? 'dark' : 'light';
  const lang = (cookieStore.get('language')?.value === 'en' ? 'en' : 'ar') as Language;
  const dir = lang === 'en' ? 'ltr' : 'rtl';
  const rawMarket = cookieStore.get('fitna_market')?.value;
  const market = (rawMarket === 'sa' || rawMarket === 'en') ? rawMarket : 'eg';
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-F4NTT7HKQP";

  return (
    <html lang={lang} dir={dir} className={theme === 'dark' ? 'dark' : ''}>
      <head>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body>
        <I18nProvider initialLang={lang} initialMarket={market}>
          <AnalyticsProvider>
            <ChatBotProvider>
              {children}
              <ChatBot context="visitor" />
            </ChatBotProvider>
          </AnalyticsProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
