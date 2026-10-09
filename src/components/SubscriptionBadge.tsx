"use client";

import { useEffect, useState } from 'react';
import { Crown, Sparkles, AlertCircle } from 'lucide-react';

interface SubscriptionBadgeProps {
  lang?: 'ar' | 'en';
}

export function SubscriptionBadge({ lang = 'ar' }: SubscriptionBadgeProps) {
  const [status, setStatus] = useState<'free' | 'individual' | 'institution'>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/payments/status');
        if (res.ok) {
          const data = await res.json();
          setStatus(data.subscription?.plan || 'free');
        }
      } catch (err) {
        console.error('Error fetching subscription status', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatus();
  }, []);

  if (loading) {
    return <div className="h-6 w-20 bg-slate-800/50 rounded-full animate-pulse border border-slate-700/50"></div>;
  }

  const isAr = lang === 'ar';

  if (status === 'free') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/50 text-slate-300 border border-slate-700/50 text-xs font-semibold">
        <AlertCircle size={14} className="text-slate-400" />
        {isAr ? 'خطة مجانية' : 'Free Plan'}
      </div>
    );
  }

  if (status === 'individual') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold shadow-[0_0_10px_rgba(245,158,11,0.1)]">
        <Sparkles size={14} className="text-amber-400" />
        {isAr ? 'خطة فردية' : 'Individual'}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 text-xs font-bold shadow-[0_0_10px_rgba(20,184,166,0.1)]">
      <Crown size={14} className="text-teal-400" />
      {isAr ? 'مؤسسي' : 'Institution'}
    </div>
  );
}
