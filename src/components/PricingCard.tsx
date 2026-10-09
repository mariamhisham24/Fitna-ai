"use client";

import { useState } from 'react';
import { Check, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface PricingCardProps {
  plan: 'individual' | 'institution';
  title: string;
  price: string;
  period?: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  popularText?: string;
  lang?: 'ar' | 'en';
}

export function PricingCard({
  plan,
  title,
  price,
  period,
  features,
  buttonText,
  isPopular = false,
  popularText,
  lang = 'ar'
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (plan === 'institution') {
      window.location.href = 'mailto:hello@fitna.ai';
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/payments/create-intention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, currency: 'EGP' }) // Using EGP as default
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const NextArrow = ({ size = 16 }: { size?: number }) =>
    lang === "ar" ? <ArrowLeft size={size} /> : <ArrowRight size={size} />;

  return (
    <article className={`price-card ${isPopular ? 'featured' : ''}`}>
      {isPopular && popularText && <span className="popular">{popularText}</span>}
      <h3>{title}</h3>
      <div className="price">
        <strong>{price}</strong>
        {period && <span>{period}</span>}
      </div>
      <ul>
        {features.map((feature, idx) => (
          <li key={idx}><Check size={15} />{feature}</li>
        ))}
      </ul>
      
      {error && <div className="text-rose-500 text-sm mt-2 font-medium">{error}</div>}
      
      <button 
        className={`${isPopular ? 'amber-button' : 'outline-button'} full mt-auto`} 
        onClick={handleSubscribe}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2 justify-center w-full">
            <Loader2 className="animate-spin" size={16} />
            {lang === 'ar' ? 'جاري التحويل...' : 'Redirecting...'}
          </span>
        ) : (
          <>
            {buttonText}
            {isPopular && <NextArrow size={15} />}
          </>
        )}
      </button>
    </article>
  );
}
