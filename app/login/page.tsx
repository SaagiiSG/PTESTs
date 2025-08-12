'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import GLogo from '@/public/google_icon.png';
import EmailAuth from '@/components/EmailAuth';
import { useState } from 'react';
import { Eye, EyeOff, User, Lock, ArrowRight, GraduationCap, BookOpen, Users, Sparkles, Mail } from 'lucide-react';
import { useLanguage } from '@/lib/language';
import LangToggle from '@/components/LangToggle';
import { Card, CardContent } from '@/components/ui/card';
import Silk from '@/components/Silk/Silk';

const formSchema = z.object({
  identifier: z.string().min(1, { message: 'Email or Phone Number is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  countryCodeDigits: z.string().optional(),
});

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: '',
      password: '',
      countryCodeDigits: '976',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const isEmail = values.identifier.includes('@');
    let identifier = values.identifier;

    if (!isEmail) {
      identifier = `+${values.countryCodeDigits}${values.identifier}`;
    }

    const result = await signIn('credentials', {
      redirect: false,
      [isEmail ? 'email' : 'phoneNumber']: identifier,
      password: values.password,
    });

    if (result?.error) {
      toast.error(result.error || 'Login failed. Please check your credentials.');
    } else if (result?.ok) {
      toast.success('Login successful!');
      router.push('/home');
    } else {
      toast.error('Something went wrong.');
    }
  };

  return (
    <div className="w-[100%] min-h-screen flex items-start justify-center">
      <div className="w-full h-full">
        {/* Main Content - 70/30 Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-center h-screen">
          {/* Left Column - 70% - Friendly Messages & Content */}
          <div className="w-full h-full lg:w-[60%] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 z-0 rounded-r-3xl overflow-hidden">
              <Silk 
                speed={3} 
                scale={0.5} 
                color="#29ADFF" 
                noiseIntensity={1.6} 
                rotation={-0.05}
              />
            </div>         
            <div className="flex flex-col justify-end pb-6 relative p-8 lg:p-12 rounded-r-3xl bg-white/10 border border-white/20 shadow-2xl z-10 h-full">
             
              <div className="relative z-10 text-center lg:text-left">
                <div className="mb-8">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto lg:mx-0 shadow-lg">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                    {t('welcomeBack')}!
                  </h1>
                  <p className="text-xl text-white/90 mb-6 drop-shadow-md">
                    {t('continueYourLearning')}
                  </p>
                </div>

                
              </div>
            </div>
          </div>

          {/* Right Column - 30% - Form Inputs */}
          <div className="w-full h-full flex justify-center items-center lg:w-[40%] pr-6">
            <Card className="w-full flex flex-col justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl rounded-3xl">
              <div className="flex justify-end pt-4 pr-4">
              <LangToggle />
              </div>
              <CardContent className="p-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email/Phone Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-4">
                      <Mail className="w-4 h-4" />
                      {t('emailOrPhone')}
                    </label>
                    <div className="flex gap-2">
                      {!form.watch('identifier').includes('@') && (
                        <div className="w-28">
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-lg">
                              +
                            </span>
                            <Input
                              {...form.register('countryCodeDigits')}
                              className="h-12 rounded-none rounded-r-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center w-20"
                              placeholder="976"
                            />
                          </div>
                        </div>
                      )}
                      <Input
                        {...form.register('identifier')}
                        className="flex-1 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={t('enterEmailOrPhone')}
                        required
                      />
                    </div>
                    {form.formState.errors.identifier && (
                      <p className="text-red-500 text-sm">{form.formState.errors.identifier.message}</p>
                    )}
                  </div>
                  
                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      {t('password')}
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...form.register('password')}
                        className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-12"
                        placeholder={t('enterPassword')}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <a 
                      href="/forgot-password" 
                      className="text-sm text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 hover:underline"
                    >
                      {t('forgotPassword')}?
                    </a>
                  </div>
                  
                  {/* Login Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t('signingIn')}...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {t('login')}
                        <ArrowRight className="w-5 h-5" />
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
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">{t('orContinueWith')}</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => signIn('google', { callbackUrl: '/home' })}
                  className="w-full h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2 w-full">
                    <Image src={GLogo} alt="Google Logo" width={24} height={24} />
                    <span className="text-sm">{t('signInWithGoogle')}</span>
                  </span>
                </Button>

                {/* Sign Up Link */}
                <div className="mt-6 text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('dontHaveAccount')} </span>
                  <a href="/sign-up" className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 hover:underline text-sm font-medium">
                    {t('signUpHere')}
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