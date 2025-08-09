'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');
  const pending = searchParams.get('pending');

  useEffect(() => {
    if (pending === 'true') {
      setStatus('pending');
      setMessage('Please check your email and click the verification link to complete your registration.');

      // Listen for cross-tab notification that verification succeeded
      let channel: BroadcastChannel | null = null;
      try {
        channel = new BroadcastChannel('email-verification');
        channel.onmessage = (event) => {
          if (event?.data === 'success') {
            // Redirect home when another tab completes verification
            router.replace('/home');
          }
        };
      } catch (_) {}

      const onStorage = (e: StorageEvent) => {
        if (e.key === 'emailVerified' && e.newValue === 'true') {
          router.replace('/home');
        }
      };
      window.addEventListener('storage', onStorage);

      return () => {
        try { channel && channel.close(); } catch (_) {}
        window.removeEventListener('storage', onStorage);
      };
    }

    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    verifyEmail(token);
  }, [token, pending]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Email verified successfully! Continue to set up your profile.');
        toast.success('Email verified successfully!');
        // Notify any open "pending" pages to redirect
        try {
          localStorage.setItem('emailVerified', 'true');
          new BroadcastChannel('email-verification').postMessage('success');
        } catch (_) {}
        // Redirect to login with callback to profile setup so user can authenticate then complete profile
        setTimeout(() => {
          router.push('/login?callbackUrl=%2Fprofile-setup');
        }, 800);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
        toast.error(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('An error occurred during verification');
      toast.error('An error occurred during verification');
    }
  };

  const resendVerification = async () => {
    setIsResending(true);
    try {
      // Get email from localStorage or prompt user
      const email = localStorage.getItem('signupEmail');
      
      if (!email) {
        toast.error('Please enter your email address to resend verification');
        setIsResending(false);
        return;
      }

      const response = await fetch('/api/auth/request-email-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Verification email sent! Please check your inbox.');
        setMessage('A new verification email has been sent to your email address.');
      } else {
        toast.error(data.error || 'Failed to resend verification email');
        setMessage(data.error || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('An error occurred while resending verification email');
      setMessage('An error occurred while resending verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4">
              {status === 'loading' && (
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              )}
              {status === 'error' && (
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              )}
              {status === 'pending' && (
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
              {status === 'pending' && 'Check Your Email'}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {status === 'loading' && 'Please wait while we verify your email address'}
              {status === 'success' && 'Your email has been successfully verified'}
              {status === 'error' && 'We encountered an issue verifying your email'}
              {status === 'pending' && 'We\'ve sent a verification link to your email'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {status === 'loading' && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Verifying your email address...</p>
              </div>
            )}

            {status === 'success' && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {status === 'error' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === 'pending' && (
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <Button
                  onClick={() => router.push('/login?callbackUrl=%2Fprofile-setup')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                >
                  Continue to Profile Setup <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {(status === 'error' || status === 'pending') && (
              <div className="space-y-4">
                <Button
                  onClick={resendVerification}
                  disabled={isResending}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>Resend Verification Email</span>
                    </div>
                  )}
                </Button>
                
                <Button
                  onClick={() => router.push('/login')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            )}

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Having trouble? Contact our support team for assistance.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading verification page...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}