'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, ArrowLeft, CheckCircle, Send, MessageSquare, Clock, Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Silk from '@/components/Silk/Silk';
import { useLanguage } from '@/lib/language';
import LangToggle from '@/components/LangToggle';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const formSchema = z.object({
    phoneNumber: z.string().min(8, { message: t('phoneNumberMustBe8Chars') }),
    countryCodeDigits: z.string().min(1, { message: t('countryCodeRequired') }),
  });
  
  const [status, setStatus] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: '',
      countryCodeDigits: '976',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const formattedPhone = `+${values.countryCodeDigits}${values.phoneNumber}`;
      const response = await fetch('/api/auth/request-password-reset-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: formattedPhone }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        toast.success('Verification code sent to your phone!');
        setCountdown(60); // Start 60-second countdown
        // Store phone number in session storage for the verification step
        sessionStorage.setItem('resetPhoneNumber', formattedPhone);
      } else {
        toast.error(data.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      toast.error('An error occurred while requesting password reset');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerifyCode = () => {
    router.push('/verify-reset-code');
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const values = form.getValues();
      const formattedPhone = `+${values.countryCodeDigits}${values.phoneNumber}`;
      
      const response = await fetch('/api/auth/request-password-reset-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: formattedPhone }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('New verification code sent!');
        setCountdown(60); // Start 60-second countdown
        sessionStorage.setItem('resetPhoneNumber', formattedPhone);
      } else {
        toast.error(data.error || 'Failed to send new code');
      }
    } catch (error) {
      console.error('Resend code error:', error);
      toast.error('An error occurred while sending the code');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
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
                color="#EF4444" 
                noiseIntensity={1.6} 
                rotation={-0.05}
              />
            </div>         
            <div className="flex flex-col justify-end pb-6 relative p-8 lg:p-12 rounded-r-3xl bg-white/10 border border-white/20 shadow-2xl z-10 h-full">
             
              <div className="relative z-10 text-center lg:text-left">
                <div className="mb-8">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto lg:mx-0 shadow-lg">
                      <Lock className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                    {t('forgotPassword')}
                  </h1>
                  <p className="text-xl text-white/90 mb-6 drop-shadow-md">
                    {t('dontWorryReset')}
                  </p>
                </div>

                {/* Benefits Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-red-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-red-400/30">
                      <Phone className="w-4 h-4 text-red-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t('quickSmsVerification')}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-pink-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-pink-400/30">
                      <Shield className="w-4 h-4 text-pink-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t('securePasswordReset')}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-red-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-red-400/30">
                      <CheckCircle className="w-4 h-4 text-red-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t('backToLearningMinutes')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 40% - Password Reset Form */}
          <div className="w-full h-full flex justify-center items-center lg:w-[40%] pr-6">
            <Card className="w-full flex flex-col justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl rounded-3xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('resetYourPassword')}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {t('enterPhoneForCode')}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {status === 'form' ? (
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {t('phoneNumber')}
                      </label>
                      <div className="flex gap-1">
                        <div className="w-24">
                          <div className="flex items-center">
                            <span className="absolute z-10 ml-3 text-gray-500 dark:text-gray-400 text-lg font-medium">+</span>
                            <Input
                              {...form.register('countryCodeDigits')}
                              className="h-12 w-20 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400 text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="976"
                              required
                            />
                          </div>
                        </div>
                        <Input
                          {...form.register('phoneNumber')}
                          className="flex-1 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder={t('enterPhoneNumber')}
                          required
                        />
                      </div>
                      {form.formState.errors.phoneNumber && (
                        <p className="text-red-500 text-sm">{form.formState.errors.phoneNumber.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {t('sending')}
                        </>
                      ) : (
                        <div className="w-full flex flex-row items-center justify-center">
                          {t('sendResetCode')} <Send className="w-4 h-4 ml-2" />
                        </div>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        {t('verificationCodeSent')}
                      </AlertDescription>
                    </Alert>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                      <p>{t('didntReceiveSms')}</p>
                      <p>{t('codeExpires10Minutes')}</p>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={handleVerifyCode}
                        className="flex flex-row items-center justify-center w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold"
                      >
                        <div className="w-full flex flex-row items-center justify-center">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          <span className="text-white"> {t('enterVerificationCode')} </span> 
                        </div>
                      </Button>
                      
                      <Button
                        onClick={handleResendCode}
                        variant="outline"
                        className="w-full flex flex-row items-center justify-center"
                        disabled={countdown > 0 || isResending}
                      >
                        {isResending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                            {t('sending')}
                          </>
                        ) : countdown > 0 ? (
                          <div className="flex items-center justify-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span className="text-gray-600 dark:text-gray-300">{t('wait')} {countdown}s </span> 
                          </div>
                        ) : (
                          <div className="w-full flex flex-row items-center justify-center">
                            <Send className="w-4 h-4 mr-2" />
                            <span className="text-gray-600 dark:text-gray-300"> {t('sendAnotherCode')} </span> 
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <Button
                    onClick={handleBackToLogin}
                    variant="ghost"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <div className="flex flex-row items-center justify-center">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">{t('backToLogin')}</span>
                    </div>
                  </Button>
                </div>

                {/* Language Toggle */}
                <div className="flex justify-center">
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