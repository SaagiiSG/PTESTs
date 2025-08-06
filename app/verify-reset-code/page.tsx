'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, ArrowLeft, CheckCircle, Send, Phone, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  code: z.string().length(6, { message: 'Please enter the 6-digit verification code.' }),
});

export default function VerifyResetCodePage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl">
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
              {status === 'success' ? 'Code Verified!' : 'Enter Verification Code'}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {status === 'success' 
                ? 'Your phone number has been verified. You can now reset your password.'
                : `Enter the 6-digit code sent to ${phoneNumber}`
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {status === 'success' ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Your verification code has been confirmed. You can now proceed to reset your password.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Button
                    onClick={handleResetPassword}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                  >
                    Reset Password
                  </Button>
                  
                  <Button
                    onClick={handleBackToForgotPassword}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Forgot Password
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Verification Code Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Verification Code
                  </label>
                  <Input
                    type="text"
                    maxLength={6}
                    {...form.register('code')}
                    className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg font-mono"
                    placeholder="000000"
                  />
                  {form.formState.errors.code && (
                    <p className="text-red-500 text-sm">{form.formState.errors.code.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="h-12 rounded-xl w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Code <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                {/* Resend Code Button */}
                <Button
                  type="button"
                  onClick={handleResendCode}
                  variant="outline"
                  className="w-full"
                  disabled={countdown > 0 || isResending}
                >
                  {isResending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Wait {countdown}s
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Resend Code
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>
                Didn't receive the code?{' '}
                {countdown > 0 ? (
                  <span className="text-gray-400">Wait {countdown}s to resend</span>
                ) : (
                  <button 
                    onClick={handleResendCode} 
                    disabled={isResending}
                    className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? 'Sending...' : 'Resend'}
                  </button>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 