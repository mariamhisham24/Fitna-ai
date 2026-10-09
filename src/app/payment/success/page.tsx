"use client";

import { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
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
      <div className="max-w-md w-full bg-slate-800/50 border border-teal-500/30 p-8 rounded-3xl shadow-2xl backdrop-blur-md text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(20,184,166,0.2)]">
          <CheckCircle2 className="w-10 h-10 text-teal-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          {isAr ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
        </h1>
        
        <p className="text-slate-300 mb-8 leading-relaxed">
          {isAr 
            ? 'مرحباً بك في فِطْنَة. تم تفعيل اشتراكك بنجاح، وأنت الآن جاهز لبدء جلسات المحاكاة غير المحدودة.' 
            : 'Welcome to Fitna. Your subscription has been activated successfully, and you are ready to start unlimited simulation sessions.'}
        </p>

        <Link href="/dashboard" className="amber-button full w-full justify-center">
          {isAr ? 'الذهاب إلى لوحة التحكم' : 'Go to Dashboard'}
          <NextArrow size={18} />
        </Link>
      </div>
    </div>
  );
}
