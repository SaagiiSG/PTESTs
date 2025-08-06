'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';

const formSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      toast.error('No reset token provided');
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
          toast.success('Password reset successfully! You are now logged in.');
          // Refresh the router to ensure session is properly established
          router.refresh();
          router.push('/home');
        } else {
          toast.success('Password reset successfully! Please log in with your new password.');
          router.push('/login');
        }
      } else {
        toast.error(data.error || 'Password reset failed');
        // Clear session storage and redirect to forgot password on error
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('resetToken');
          sessionStorage.removeItem('resetPhoneNumber');
        }
        router.push('/forgot-password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An error occurred during password reset');
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

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl">
            <CardContent className="p-6">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>Invalid reset link. Please request a new password reset.</AlertDescription>
              </Alert>
                              <Button
                  onClick={() => {
                    // Clear session storage and redirect to forgot password
                    if (typeof window !== 'undefined') {
                      sessionStorage.removeItem('resetToken');
                      sessionStorage.removeItem('resetPhoneNumber');
                    }
                    router.push('/forgot-password');
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                >
                  Request New Reset Link
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Enter your new password below
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* New Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...form.register('password')}
                      className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-12"
                      placeholder="Enter your new password"
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
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      {...form.register('confirmPassword')}
                      className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-12"
                      placeholder="Confirm your new password"
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
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      Reset Password <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Remember your password? <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Log in here</a></p>
            </div>
          </CardContent>
        </Card>
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
