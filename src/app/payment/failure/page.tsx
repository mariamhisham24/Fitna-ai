"use client";

import { useEffect, useState } from 'react';
import { XCircle, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function PaymentFailurePage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    const langMatch = document.cookie.match(/(?:^|;\s*)language=(ar|en)(?:;|$)/);
    if (langMatch && (langMatch[1] === "ar" || langMatch[1] === "en")) {
      setLang(langMatch[1]);
    }
  }, []);

  const isAr = lang === 'ar';
  const NextArrow = ({ size = 16 }) => isAr ? <ArrowLeft size={size} /> : <ArrowRight size={size} />;

  return (
    <div className="min-h-screen bg-[#071B3A] flex flex-col items-center justify-center p-4 font-sans text-slate-200" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full bg-slate-800/50 border border-rose-500/30 p-8 rounded-3xl shadow-2xl backdrop-blur-md text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
          <XCircle className="w-10 h-10 text-rose-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          {isAr ? 'فشلت عملية الدفع' : 'Payment Failed'}
        </h1>
        
        <p className="text-slate-300 mb-8 leading-relaxed">
          {isAr 
            ? 'عذراً، لم نتمكن من إتمام عملية الدفع. يرجى التحقق من بطاقتك والمحاولة مرة أخرى.' 
            : 'Sorry, we could not process your payment. Please check your card and try again.'}
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Link href="/#pricing" className="amber-button full justify-center">
            <RefreshCw size={16} />
            {isAr ? 'حاول مرة أخرى' : 'Try Again'}
          </Link>
          <Link href="/dashboard" className="outline-button full justify-center text-slate-300">
            {isAr ? 'العودة للوحة التحكم' : 'Return to Dashboard'}
          </Link>
        </div>
      </div>
    </div>
  );
}
