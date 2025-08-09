'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, ArrowLeft, CheckCircle, Send, MessageSquare, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  phoneNumber: z.string().min(8, { message: 'Phone number must be at least 8 characters.' }),
  countryCodeDigits: z.string().min(1, { message: 'Country code is required.' }),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
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
        toast.error(data.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Resend code error:', error);
      toast.error('An error occurred while sending verification code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="h-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
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
                  <Phone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {status === 'success' ? 'Check Your Phone' : 'Forgot Password?'}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {status === 'success' 
                ? 'We\'ve sent you a verification code via SMS'
                : 'Enter your phone number and we\'ll send you a verification code to reset your password'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {status === 'success' ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    We've sent a verification code to your phone number. Please check your SMS and enter the code to reset your password.
                  </AlertDescription>
                </Alert>
                
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <p>Didn't receive the SMS? Check your phone or try again.</p>
                  <p>The verification code will expire in 10 minutes for security reasons.</p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleVerifyCode}
                    className="flex flex-row items-center justify-center w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                  >
                    <div className="flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span className="text-white"> Enter Verification Code </span> 
                    </div>
                  </Button>
                  
                  <Button
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
                      <div className="flex items-center justify-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-gray-600 dark:text-gray-300">Wait {countdown}s </span> 
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Send className="w-4 h-4 mr-2" />
                        <span className="text-gray-600 dark:text-gray-300"> Send Another Code </span> 
                      </div>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => router.push('/login')}
                    variant="outline"
                    className="w-full"
                  >
                    <div className="flex items-center justify-center">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300"> Back to Login </span> 
                    </div>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Phone Number Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <div className="h-12 flex gap-2">
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xl">
                        +
                      </span>
                      <Input
                        {...form.register('countryCodeDigits')}
                        className="h-full rounded-none rounded-r-lg w-20 text-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="976"
                        type="number"
                      />
                    </div>
                    <Input
                      {...form.register('phoneNumber')}
                      className="h-full text-lg rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      type="number"
                      placeholder="8816XXXX"
                    />
                  </div>
                  {form.formState.errors.phoneNumber && (
                    <p className="text-red-500 text-sm">{form.formState.errors.phoneNumber.message}</p>
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
                      Sending Code...
                    </>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="text-white"> Send Verification Code </span> 
                      <Send className="w-4 h-4 ml-2" />
                    </div>
                  )}
                </Button>
              </form>
            )}

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Remember your password? <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Log in here</a></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 