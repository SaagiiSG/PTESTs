'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, Lock, Eye, EyeOff, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useLanguage } from '@/lib/language';
import Silk from '@/components/Silk/Silk';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formSchema = z.object({
    password: z.string().min(6, { message: t('passwordMustBe6Chars') }),
    confirmPassword: z.string().min(6, { message: t('passwordMustBe6Chars') }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('passwordsDontMatch'),
    path: ["confirmPassword"],
  });

  // Get token from URL params or session storage (for phone verification flow)
  const urlToken = searchParams.get('token');
  const sessionToken = typeof window !== 'undefined' ? sessionStorage.getItem('resetToken') : null;
  const token = urlToken || sessionToken;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token) {
      toast.error(t('noResetToken'));
      router.push('/forgot-password');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token,
          newPassword: values.password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear session storage after successful reset
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('resetToken');
          sessionStorage.removeItem('resetPhoneNumber');
        }
        
        // Automatically sign in the user with their new password
        console.log('Attempting auto-login with:', {
          email: data.user.email,
          phoneNumber: data.user.phoneNumber,
          hasEmail: !!data.user.email,
          hasPhone: !!data.user.phoneNumber
        });
        
        const signInResult = await signIn('credentials', {
          redirect: false,
          password: values.password,
          ...(data.user.email ? { email: data.user.email } : { phoneNumber: data.user.phoneNumber }),
        });

        console.log('Sign-in result:', signInResult);

        if (signInResult?.ok) {
          toast.success(t('passwordResetSuccess'));
          // Refresh the router to ensure session is properly established
          router.refresh();
          router.push('/home');
        } else {
          toast.success(t('passwordResetSuccessLogin'));
          router.push('/login');
        }
      } else {
        toast.error(data.error || t('passwordResetFailed'));
        // Clear session storage and redirect to forgot password on error
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('resetToken');
          sessionStorage.removeItem('resetPhoneNumber');
        }
        router.push('/forgot-password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(t('passwordResetError'));
      // Clear session storage and redirect to forgot password on error
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('resetToken');
        sessionStorage.removeItem('resetPhoneNumber');
      }
      router.push('/forgot-password');
    } finally {
      setIsSubmitting(false);
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
                color="#3B82F6" 
                noiseIntensity={1.6} 
                rotation={-0.05}
              />
            </div>         
            <div className="flex flex-col justify-end pb-6 relative p-8 lg:p-12 rounded-r-3xl bg-white/10 border border-white/20 shadow-2xl z-10 h-full">
             
              <div className="relative z-10 text-center lg:text-left">
                <div className="mb-8">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto lg:mx-0 shadow-lg">
                      <Lock className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                    {t('resetYourPassword')}
                  </h1>
                  <p className="text-xl text-white/90 mb-6 drop-shadow-md">
                    {t('enterYourNewPassword')}
                  </p>
                </div>

                {/* Benefits Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-blue-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-blue-400/30">
                      <Lock className="w-4 h-4 text-blue-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t('securePasswordReset')}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-purple-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-purple-400/30">
                      <Shield className="w-4 h-4 text-purple-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t('strongPasswordRequirements')}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-blue-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-blue-400/30">
                      <CheckCircle className="w-4 h-4 text-blue-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t('instantAccessAfterReset')}</span>
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
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('resetYourPassword')}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {t('enterYourNewPassword')}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {!token ? (
                  <div className="space-y-4">
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{t('invalidResetLink')}</AlertDescription>
                    </Alert>
                    <Button
                      onClick={() => router.push('/forgot-password')}
                      className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                    >
                      {t('requestNewResetLink')}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* New Password Field */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('newPassword')}
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...form.register('password')}
                          className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-12"
                          placeholder={t('enterYourNewPasswordPlaceholder')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {form.formState.errors.password && (
                        <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('confirmNewPassword')}
                      </label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          {...form.register('confirmPassword')}
                          className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-12"
                          placeholder={t('confirmYourNewPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {form.formState.errors.confirmPassword && (
                        <p className="text-red-500 text-sm">{form.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="h-12 rounded-xl w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          <span className="text-white"> {t('resettingPassword')} </span> 
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span className="text-white"> {t('resetPassword')} </span> 
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </div>
                      )}
                    </Button>
                  </form>
                )}

                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  <p>{t('rememberPassword')} <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">{t('logInHere')}</a></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading reset password page...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
