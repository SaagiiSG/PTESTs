'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, ArrowLeft, CheckCircle, Send, Phone, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Silk from '@/components/Silk/Silk';
import { useLanguage } from '@/lib/language';
import LangToggle  from '@/components/LangToggle';

export default function VerifyResetCodePage() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const formSchema = z.object({
    code: z.string().length(6, { message: t('codeMustBe6Digits') }),
  });
  const [status, setStatus] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    // Get phone number from session storage
    const storedPhone = sessionStorage.getItem('resetPhoneNumber');
    if (!storedPhone) {
      // Redirect to forgot password if no phone number
      router.push('/forgot-password');
      return;
    }
    setPhoneNumber(storedPhone);
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber,
          code: values.code 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        toast.success('Code verified successfully!');
        // Store the verification token for the reset password page
        sessionStorage.setItem('resetToken', data.token);
      } else {
        toast.error(data.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Code verification error:', error);
      toast.error('An error occurred while verifying the code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/request-password-reset-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('New verification code sent!');
        setCountdown(60); // Start 60-second countdown
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

  const handleResetPassword = () => {
    router.push('/reset-password');
  };

  const handleBackToForgotPassword = () => {
    sessionStorage.removeItem('resetPhoneNumber');
    router.push('/forgot-password');
  };

  if (!phoneNumber) {
    return null; // Will redirect to forgot password
  }

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
                color="#10B981" 
                noiseIntensity={1.6} 
                rotation={-0.05}
              />
            </div>         
            <div className="flex flex-col justify-end pb-6 relative p-8 lg:p-12 rounded-r-3xl bg-white/10 border border-white/20 shadow-2xl z-10 h-full">
             
              <div className="relative z-10 text-center lg:text-left">
                <div className="mb-8">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl flex items-center justify-center mx-auto lg:mx-0 shadow-lg">
                      <MessageSquare className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                    {status === 'success' ? t('codeVerified') : t('enterVerificationCode')}
                  </h1>
                  <p className="text-xl text-white/90 mb-6 drop-shadow-md">
                    {status === 'success' 
                      ? t('phoneNumberVerified')
                      : `${t('enterCodeSentTo')} ${phoneNumber}`
                    }
                  </p>
                </div>

                {/* Benefits Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-emerald-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-emerald-400/30">
                      <Phone className="w-4 h-4 text-emerald-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t('quickSmsVerification')}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-teal-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-teal-400/30">
                      <Shield className="w-4 h-4 text-emerald-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t('securePasswordReset')}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-emerald-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-emerald-400/30">
                      <CheckCircle className="w-4 h-4 text-emerald-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t('backToLearningMinutes')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 40% - Verification Form */}
          <div className="w-full h-full flex justify-center items-center lg:w-[40%] pr-6">
            <Card className="w-full flex flex-col justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl rounded-3xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4">
                  {status === 'success' ? (
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {status === 'success' ? t('codeVerified') : t('enterVerificationCode')}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {status === 'success' 
                    ? t('phoneNumberVerified')
                    : `${t('enterCodeSentTo')} ${phoneNumber}`
                  }
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {status === 'success' ? (
                  <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        {t('verificationCodeConfirmed')}
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <Button
                        onClick={handleResetPassword}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
                      >
                        {t('proceedToResetPassword')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Verification Code Field */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('verificationCode')}
                      </label>
                      <Input
                        type="text"
                        maxLength={6}
                        {...form.register('code')}
                        className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg font-mono"
                        placeholder={t('verificationCodePlaceholder')}
                      />
                      {form.formState.errors.code && (
                        <p className="text-red-500 text-sm">{form.formState.errors.code.message}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="h-12 rounded-xl w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          <span className="text-white"> {t('verifying')} </span> 
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span className="text-white"> {t('verifyCode')} </span> 
                          <CheckCircle className="w-4 h-4 ml-2" />
                        </div>
                      )}
                    </Button>

                    {/* Resend Code Section */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {t('didntReceiveCode')}
                      </p>
                      
                      <Button
                        onClick={handleResendCode}
                        variant="outline"
                        className="w-full"
                        disabled={countdown > 0 || isResending}
                      >
                        {isResending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                            {t('sending')}
                          </>
                        ) : countdown > 0 ? (
                          <>
                            <Clock className="w-4 h-4 mr-2" />
                            {t('wait')} {countdown}s
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            {t('sendAnotherCode')}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}

                <div className="text-center">
                  <Button
                    onClick={handleBackToForgotPassword}
                    variant="ghost"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('backToForgotPassword')}
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