'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mail, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function VerifyChoicePage() {
  const router = useRouter();
  const [hasEmail, setHasEmail] = useState<boolean>(false);
  const [hasPhone, setHasPhone] = useState<boolean>(false);

  useEffect(() => {
    // Check what data we have from signup
    const email = localStorage.getItem('signupEmail');
    const phone = localStorage.getItem('signupPhoneNumber');
    setHasEmail(!!email);
    setHasPhone(!!phone);
  }, []);

  const handleEmailVerify = async () => {
    const email = localStorage.getItem('signupEmail');
    if (!email) {
      toast.error('No email found. Please sign up again or use SMS verification.');
      return;
    }
    try {
      const res = await fetch('/api/auth/request-email-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to send verification email');
      } else {
        toast.success('Verification email sent!');
      }
    } catch (e: any) {
      toast.error('Could not send verification email');
    }
    router.push('/verify-email?pending=true');
  };

  const handleSmsVerify = async () => {
    const phone = localStorage.getItem('signupPhoneNumber');
    if (!phone) {
      toast.error('No phone number found. Please sign up again or use email verification.');
      return;
    }
    try {
      const res = await fetch('/api/auth/request-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Failed to send SMS code');
        return;
      }
      if (data?.devCode) {
        try { localStorage.setItem('devSmsCode', data.devCode); } catch (_) {}
      }
      toast.success('SMS code sent!');
      router.push('/verify-sms');
    } catch (_) {
      toast.error('Could not send SMS code');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-width-sm flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-center">Verify your account</h1>
        <p className="text-center text-gray-600">Choose your preferred verification method</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            disabled={!hasEmail}
            onClick={handleEmailVerify}
            className="h-12 px-6"
          >
            <Mail className="w-5 h-5 mr-2" /> Verify via Email
          </Button>
          <Button
            disabled={!hasPhone}
            variant="outline"
            onClick={handleSmsVerify}
            className="h-12 px-6"
          >
            <Phone className="w-5 h-5 mr-2" /> Verify via SMS
          </Button>
        </div>
        {(!hasEmail || !hasPhone) && (
          <p className="text-center text-sm text-gray-500">Tip: Provide both email and phone during signup to unlock both options.</p>
        )}
      </div>
    </div>
  );
}


