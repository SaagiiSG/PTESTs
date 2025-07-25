'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function EmailAuth({ isSignup = false }: { isSignup?: boolean }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const router = useRouter();

  const handleSendCode = async () => {
    const res = await fetch('/api/auth/email/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setStep('code');
      toast.success('Verification code sent to your email!');
    } else {
      toast.error('Failed to send code');
    }
  };

  const handleVerifyCode = async () => {
    const res = await fetch('/api/auth/email/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (res.ok) {
      if (data.needsProfileSetup) {
        router.push('/profile-setup');
      } else {
        router.push('/home');
      }
      toast.success('Authentication successful!');
    } else {
      toast.error('Invalid code');
    }
  };

  return (
    <div className="space-y-4">
      {step === 'email' ? (
        <>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="h-12 rounded-xl"
          />
          <Button onClick={handleSendCode} className="w-full h-12 rounded-xl">
            Send Verification Code
          </Button>
        </>
      ) : (
        <>
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter verification code"
            className="h-12 rounded-xl"
          />
          <Button onClick={handleVerifyCode} className="w-full h-12 rounded-xl">
            Verify
          </Button>
        </>
      )}
    </div>
  );
}