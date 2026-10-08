'use client';

import { signOutAction } from '@/app/(auth)/login/actions';
import { trackEvent } from '@/lib/analytics';

interface LogoutButtonProps {
  className?: string;
  children: React.ReactNode;
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const handleLogout = () => {
    trackEvent('user_logged_out', undefined, { send_instantly: true, transport: 'sendBeacon' });
  };

  return (
    <form action={signOutAction} onSubmit={handleLogout} className="inline">
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
