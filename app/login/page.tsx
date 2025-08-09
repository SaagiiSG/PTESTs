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
import { Eye, EyeOff } from 'lucide-react';

const formSchema = z.object({
  identifier: z.string().min(1, { message: 'Email or Phone Number is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  countryCodeDigits: z.string().optional(),
});

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

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

    // Aggressive session clearing
    console.log('Clearing all sessions and storage...');
    
    // Clear all browser storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies including NextAuth specific ones
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Clear NextAuth specific cookies
    document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // First sign out to clear any existing session
    await signOut({ redirect: false });

    console.log('Signing in with:', { identifier, isEmail });
    const result = await signIn('credentials', {
      redirect: false,
      [isEmail ? 'email' : 'phoneNumber']: identifier,
      password: values.password,
      callbackUrl: `/home?t=${Date.now()}`, // Force new session
    });

    console.log('SIGN IN RESULT →', result);

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
    <section className="w-full h-auto md:w-1/2 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center  py-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div>
          <label className="block text-sm font-medium mb-2 ml-1 text-gray-700">Email or Phone Number</label>
          <div className="h-12 flex gap-2">
            {!form.watch('identifier').includes('@') && (
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +
                </span>
                <Input
                  {...form.register('countryCodeDigits')}
                  className="h-full rounded-none rounded-r-lg w-16 text-sm"
                  placeholder="976"
                />
              </div>
            )}
            <Input
              {...form.register('identifier')}
              placeholder="Email or Phone Number"
              className="h-full text-sm rounded-xl flex-1"
            />
          </div>
          {form.formState.errors.identifier && (
            <p className="text-red-600 text-sm mt-1">{form.formState.errors.identifier.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 ml-1 text-gray-700">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              {...form.register('password')}
              className="rounded-xl h-12 pr-12"
              placeholder="*********"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-red-600 text-sm mt-1">{form.formState.errors.password.message}</p>
          )}
        </div>
        
        {/* Forgot Password Link */}
        <div className="text-right">
          <a 
            href="/forgot-password" 
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Forgot your password?
          </a>
        </div>
        
        <Button type="submit" className="w-full h-12 text-md rounded-xl">
          Login
        </Button>
      </form>

      <div className="w-full h-[1px] bg-gray-300 my-6"></div>

      <div className="w-full space-y-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => signIn('google', { callbackUrl: '/home' })}
          className="h-12 rounded-xl w-full"
        >
          <span className="flex flex-row items-center justify-center gap-2">
            <Image src={GLogo} alt="Google Logo" width={24} height={24} className="" />
            <p className="text-sm">Sign in with Google</p>
          </span>
        </Button>
      </div>

      <div className="mt-6 text-center">
        <span className="text-sm text-gray-600">Don't have an account? </span>
        <a href="/sign-up" className="text-blue-600 hover:underline text-sm">
          Sign up here
        </a>
      </div>
    </section>
  );
}