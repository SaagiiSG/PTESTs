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
import { User, Phone, Lock, ArrowRight, Shield, Sparkles, Mail, GraduationCap, BookOpen, Users } from 'lucide-react';
import { useLanguage } from '@/lib/language';
import LangToggle from '@/components/LangToggle';
import Silk from '@/components/Silk/Silk';

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
  const { t } = useLanguage();

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
          setError('This.email is already registered.');
        } else {
          toast.error(data.message);
          setError(data.message);
        }
        return;
      }

      if (res.ok) {
        toast.success(t('accountCreatedSuccessfully'));
        localStorage.setItem('signupPhoneNumber', formattedPhone);
        localStorage.setItem('signupEmail', values.email);
        router.push('/verify');
      } else {
        console.error('Registration failed:', data);
        setError(data.message || 'Registration failed. Please try again.');
        toast.error(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please check your connection and try again.');
      toast.error('Network error. Please check your connection and try again.');
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
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                    {t('createYourAccount')}
                  </h1>
                  <p className="text-xl text-white/90 mb-6 drop-shadow-md">
                    {t('joinOurLearning')}
                  </p>
                </div>

                {/* Benefits Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-purple-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-purple-400/30">
                      <GraduationCap className="w-4 h-4 text-purple-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t('unlockYourPotential')}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-indigo-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-indigo-400/30">
                      <Users className="w-4 h-4 text-indigo-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t('joinThousandsStudents')}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-violet-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-violet-400/30">
                      <BookOpen className="w-4 h-4 text-violet-300" />
                    </div>
                    <span className="text-white/90 drop-shadow-sm">{t('accessQualityContent')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 40% - Form Inputs */}
          <div className="w-full h-full flex justify-center items-center lg:w-[40%] pr-6">
            <Card className="w-full flex flex-col justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl rounded-3xl">
              <CardContent className="p-6">
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertTitle>{t('error')}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(onSubmit, onInvalid)(e as any); }} className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {t('fullName') || 'Full Name'}
                    </label>
                    <Input
                      type="text"
                      {...form.register('name')}
                      className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={t('enterFullName') || 'Enter your full name'}
                      required
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {t('emailAddress')}
                    </label>
                    <Input
                      type="email"
                      {...form.register('email')}
                      className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={t('enterEmailAddress')}
                      required
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-500 text-sm">{(form.formState.errors as any).email?.message}</p>
                    )}
                  </div>

                  {/* Phone Number Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {t('phoneNumber')}
                    </label>
                    <div className="flex gap-2">
                      <div className="w-20">
                        <Input
                          {...form.register('countryCodeDigits')}
                          className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                          placeholder="976"
                          required
                        />
                      </div>
                      <Input
                        {...form.register('phoneNumber')}
                        className="flex-1 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={t('enterPhoneNumber')}
                        required
                      />
                    </div>
                    {form.formState.errors.phoneNumber && (
                      <p className="text-red-500 text-sm">{form.formState.errors.phoneNumber.message}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      {t('password')}
                    </label>
                    <Input
                      type="password"
                      {...form.register('password')}
                      className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={t('createSecurePassword')}
                      minLength={6}
                      required
                    />
                    {form.formState.errors.password && (
                      <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
                    )}
                  </div>

                  {/* Security Notice */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200 mb-1">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium text-sm">{t('secureRegistration')}</span>
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {t('secureRegistrationDesc')}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t('creatingAccount')}...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {t('createAccount')}
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('alreadyHaveAccount')} </span>
                  <a href="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium hover:underline">
                    {t('loginHere')}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}