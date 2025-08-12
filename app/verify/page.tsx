'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Shield, CheckCircle, Clock, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Silk from '@/components/Silk/Silk';
import { useLanguage } from '@/lib/language';
import  LangToggle  from '@/components/LangToggle';

export default function VerifyChoicePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [hasEmail, setHasEmail] = useState<boolean>(false);
  const [hasPhone, setHasPhone] = useState<boolean>(false);
  const [smsCountdown, setSmsCountdown] = useState<number>(0);
  const [isSmsLoading, setIsSmsLoading] = useState<boolean>(false);
  const [smsAttempts, setSmsAttempts] = useState<number>(0);

  useEffect(() => {
    // Check what data we have from signup
    const email = localStorage.getItem('signupEmail');
    const phone = localStorage.getItem('signupPhoneNumber');
    setHasEmail(!!email);
    setHasPhone(!!phone);

    // Check if there's an existing SMS cooldown
    const lastSmsTime = localStorage.getItem('lastSmsTime');
    if (lastSmsTime) {
      const timeDiff = Math.max(0, 60 - Math.floor((Date.now() - parseInt(lastSmsTime)) / 1000));
      if (timeDiff > 0) {
        setSmsCountdown(timeDiff);
      }
    }
  }, []);

  // SMS countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (smsCountdown > 0) {
      timer = setTimeout(() => setSmsCountdown(smsCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [smsCountdown]);

  const handleEmailVerify = async () => {
    const email = localStorage.getItem('signupEmail');
    if (!email) {
      toast.error(t('noEmailFound'));
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
        toast.error(data.error || t('failedToSendEmail'));
      } else {
        toast.success(t('verificationEmailSent'));
      }
    } catch (e: any) {
      toast.error(t('couldNotSendEmail'));
    }
    router.push('/verify-email?pending=true');
  };

  const handleSmsVerify = async () => {
    // Check rate limiting
    if (smsCountdown > 0) {
      toast.error(t('pleaseWaitBeforeResending'));
      return;
    }

    if (smsAttempts >= 3) {
      toast.error(t('tooManySmsAttempts'));
      return;
    }

    const phone = localStorage.getItem('signupPhoneNumber');
    if (!phone) {
      toast.error(t('noPhoneFound'));
      return;
    }

    setIsSmsLoading(true);
    try {
      const res = await fetch('/api/auth/request-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        toast.error(data.error || t('failedToSendSms'));
        return;
      }

      if (data?.devCode) {
        try { localStorage.setItem('devSmsCode', data.devCode); } catch (_) {}
      }

      // Set rate limiting
      setSmsCountdown(60);
      setSmsAttempts(prev => prev + 1);
      localStorage.setItem('lastSmsTime', Date.now().toString());
      
      toast.success(t('smsCodeSent'));
      router.push('/verify-sms');
    } catch (_) {
      toast.error(t('couldNotSendSms'));
    } finally {
      setIsSmsLoading(false);
    }
  };

  return (
    <div className="w-[100%] min-h-screen flex items-start justify-center">
      <div className="w-full h-full">
        {/* Main Content - 60/40 Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-center h-screen">
          {/* Left Column - 60% - Friendly Messages & Content */}
          <div className="w-full h-full lg:w-[60%] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 z-0 rounded-r-3xl overflow-hidden">
              <Silk 
                speed={3} 
                scale={0.5} 
                color="#8B5CF6" 
                noiseIntensity={1.6} 
                rotation={-0.05}
              />
            </div>         
            <div className="flex flex-col justify-end pb-6 relative p-8 lg:p-12 rounded-r-3xl bg-white/10 border border-white/20 shadow-2xl z-10 h-full">
             
              <div className="relative z-10 text-center lg:text-left">
                <div className="mb-8">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto lg:mx-0 shadow-lg">
                      <Shield className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                    {t('verifyYourAccount')}
                  </h1>
                  <p className="text-xl text-white/90 mb-6 drop-shadow-md">
                    {t('chooseVerificationMethod')}
                  </p>
                </div>

                {/* Benefits Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-purple-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-purple-400/30">
                      <Shield className="w-4 h-4 text-purple-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t('secureAccountAccess')}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-indigo-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-indigo-400/30">
                      <CheckCircle className="w-4 h-4 text-indigo-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t('quickVerification')}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-purple-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-purple-400/30">
                      <Mail className="w-4 h-4 text-purple-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t('multipleOptions')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 40% - Verification Options */}
          <div className="w-full h-full flex justify-center items-center lg:w-[40%] pr-6">
            <Card className="w-full flex flex-col justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl rounded-3xl">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    {t('verificationOptions')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('selectPreferredMethod')}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Email Verification Option */}
                  <Button
                    disabled={!hasEmail}
                    onClick={handleEmailVerify}
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail className="w-5 h-5 mr-3" /> 
                    {t('verifyViaEmail')}
                  </Button>

                  {/* SMS Verification Option */}
                  <Button
                    disabled={!hasPhone || smsCountdown > 0 || smsAttempts >= 3}
                    onClick={handleSmsVerify}
                    variant="outline"
                    className="w-full h-14 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSmsLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3"></div>
                        {t('sending')}
                      </>
                    ) : smsCountdown > 0 ? (
                      <>
                        <Clock className="w-5 h-5 mr-3" />
                        {t('wait')} {smsCountdown}s
                      </>
                    ) : (
                      <>
                        <Phone className="w-5 h-5 mr-3" /> 
                        {t('verifyViaSms')}
                      </>
                    )}
                  </Button>
                </div>

                {/* Status Messages */}
                {(!hasEmail || !hasPhone) && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                      {t('provideBothForOptions')}
                    </p>
                  </div>
                )}

                {smsAttempts >= 3 && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300 text-center">
                      {t('smsLimitReached')}
                    </p>
                  </div>
                )}

                {/* Language Toggle */}
                <div className="mt-6 flex justify-center">
                  <LangToggle />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


