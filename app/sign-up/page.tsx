'use client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input} from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Phone, Lock, ArrowRight, Shield, Sparkles, Mail } from 'lucide-react';

// Collect both email and phone; user chooses later how to verify
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  countryCodeDigits: z.string().min(1, { message: 'Country code is required.' }),
  phoneNumber: z.string().min(8, { message: 'Phone number must be at least 8 characters.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      countryCodeDigits: '976',
      phoneNumber: '',
      password: '',
    },
  });

  const onInvalid = (errors: any) => {
    console.error('Validation errors:', errors);
    const firstErrorKey = Object.keys(errors)[0];
    const firstErrorMsg = firstErrorKey && (errors[firstErrorKey]?.message || errors[firstErrorKey]?.root?.message);
    toast.error(firstErrorMsg || 'Please complete the required fields.');
    if (firstErrorKey) {
      const field = document.querySelector(`[name="${firstErrorKey}"]`) as HTMLElement | null;
      if (field && typeof field.focus === 'function') field.focus();
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('Form submitted with values:', values);
    setError('');
    const formattedPhone = values.countryCodeDigits && values.phoneNumber
      ? `+${values.countryCodeDigits}${values.phoneNumber}`
      : '';
    console.log('Submitting signup:', { 
      name: values.name,
      email: values.email,
      phoneNumber: formattedPhone,
    });

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phoneNumber: formattedPhone,
          password: values.password,
        }),
      });

      const data = await res.json();
      console.log('Register response:', { status: res.status, data });

      if (res.status === 409) {
        if (data.message.includes('phone number')) {
          toast.error('This phone number is already registered.');
          setError('This phone number is already registered.');
        } else if (data.message.includes('email')) {
          toast.error('This email is already registered.');
          setError('This email is already registered.');
        } else {
          toast.error(data.message);
          setError(data.message);
        }
        return;
      }

      if (res.ok) {
        // Store for potential resend flows and seamless auto-login later
        if (values.email) {
          localStorage.setItem('signupEmail', values.email);
        }
        if (formattedPhone) {
          localStorage.setItem('signupPhoneNumber', formattedPhone);
        }
        try {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('signupPassword', values.password);
          }
        } catch (_) {}

        // Do not send any verification yet; user will choose the method next
        toast.success('Registration successful! Choose your verification method.');
        router.push('/verify');
      } else {
        toast.error(data.error || 'Registration failed. Please try again.');
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error('Something went wrong during registration.');
      setError('Something went wrong during registration. Check console for details.');
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Your Account</h1>
          <p className="text-gray-600 dark:text-gray-300">Join our learning community and start your journey</p>
        </div>

        {/* Form Card */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl w-full rounded-3xl">
          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(onSubmit, onInvalid)(e as any); }} className="space-y-6">

              {/* Two Column Grid for Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <Input
                    {...form.register('name')}
                    className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your full name"
                    required
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm">{(form.formState.errors as any).name?.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <Input
                    type="email"
                    {...form.register('email')}
                    className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your email address"
                    required
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm">{(form.formState.errors as any).email?.message}</p>
                  )}
                </div>
              </div>

              {/* Phone Number Field - Full Width */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <div className="flex gap-2 h-12">
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xl">
                      +
                    </span>
                    <Input
                      {...form.register('countryCodeDigits')}
                      className="h-full rounded-none rounded-r-lg w-20 text-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="976"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                    />
                  </div>
                  <Input
                    {...form.register('phoneNumber')}
                    className="h-full text-lg rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="8816XXXX"
                    minLength={8}
                    required
                  />
                </div>
                {form.formState.errors.phoneNumber && (
                  <p className="text-red-500 text-sm">{(form.formState.errors as any).phoneNumber?.message}</p>
                )}
              </div>

              {/* Password Field - Full Width */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <Input
                  type="password"
                  {...form.register('password')}
                  className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Create a secure password"
                  minLength={6}
                  required
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
                )}
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-1">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium text-sm">Secure Registration</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your information is protected with encryption. We'll send a verification email and an SMS code; you can verify using either one.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                id="signup-submit"
                type="submit"
                onClick={() => form.handleSubmit(onSubmit, onInvalid)()}
                aria-busy={form.formState.isSubmitting}
                className="h-12 rounded-xl w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-300"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="text-sm">Create Account</span> <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <Button
              onClick={() => signIn('google', { callbackUrl: '/profile-setup' })}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            > 
              <span className="flex items-center justify-center gap-2 w-full">
                <svg
                className="w-6 h-6"
                viewBox="0 0 533.5 544.3"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M533.5 278.4c0-17.4-1.4-34.1-4.4-50.4H272v95.5h146.9c-6.4 34.6-26.1 63.9-55.8 83.5v69.2h90.1c52.7-48.6 82.9-120.2 82.9-197.8z"
                  fill="#4285f4"
                />
                <path
                  d="M272 544.3c74.2 0 136.5-24.6 182-66.6l-90.1-69.2c-25 16.8-56.9 26.7-91.9 26.7-70.6 0-130.5-47.7-152-111.4H26.3v69.9C71.4 485.7 166.6 544.3 272 544.3z"
                  fill="#34a853"
                />
                <path
                  d="M120 323.8c-5.6-16.6-8.8-34.4-8.8-52.7s3.2-36.1 8.8-52.7V148.5H26.3c-18.9 37.7-29.7 80.3-29.7 124.6s10.8 86.9 29.7 124.6l93.7-73.9z"
                  fill="#fbbc04"
                />
                <path
                  d="M272 107.9c39.7 0 75.3 13.6 103.3 40.5l77.5-77.5C404.4 24.6 344.1 0 272 0 166.6 0 71.4 58.6 26.3 148.5l93.7 73.9c21.5-63.7 81.4-111.4 152-111.4z"
                  fill="#ea4335"
                />
                </svg>
                <span className="text-sm">Sign up with Google</span>
              </span>
            </Button>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
              <a href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline">
                Log in here
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}