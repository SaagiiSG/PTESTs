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

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phoneNumber: z.string().min(8, { message: 'Phone number must be at least 8 characters.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  countryCodeDigits: z.string().min(1, { message: 'Country code is required.' }),
});

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      password: '',
      countryCodeDigits: '976',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('Form submitted with values:', values);
    setError('');
    const formattedPhone = `+${values.countryCodeDigits}${values.phoneNumber}`;
    console.log('Submitting phone signup:', { name: values.name, phoneNumber: formattedPhone });

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          phoneNumber: formattedPhone,
          password: values.password,
        }),
      });

      const data = await res.json();
      console.log('Register response:', { status: res.status, data });

      if (res.status === 409) {
        toast.error('This phone number is already registered.');
        setError('This phone number is already registered.');
        return;
      }

      if (res.ok) {
        toast.success('Registration successful!');
        localStorage.setItem('signupPhoneNumber', formattedPhone);

        const verifyRes = await fetch('/api/auth/request-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: formattedPhone }),
        });

        const verifyData = await verifyRes.json();
        console.log('Request-verification response:', { status: verifyRes.status, verifyData });

        if (verifyRes.ok) {
          toast.success('Verification code sent!');
          router.push('/verify-sms');
        } else {
          toast.error(verifyData.error || 'Failed to send verification code.');
          setError(verifyData.error || 'Failed to send verification code.');
        }
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
    <div className="w-full flex justify-center items-center p-4">
      <div className="w-[60%]">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="h-auto">
            <label className="mb-1 ml-1 text-md">Name</label>
            <Input
              {...form.register('name')}
              className="h-12 rounded-xl"
              placeholder="First name and last name"
            />
            {form.formState.errors.name && (
              <p className="text-red-600 text-sm mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 ml-1 text-md">Country Code & Phone Number</label>
            <div className="flex gap-2 h-12">
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-xl">
                  +
                </span>
                <Input
                  {...form.register('countryCodeDigits')}
                  className="h-full rounded-none rounded-r-lg w-20 text-lg"
                  placeholder="976"
                  type="number"
                />
              </div>
              <Input
                {...form.register('phoneNumber')}
                className="h-full text-lg rounded-xl"
                type="number"
                placeholder="8816XXXX"
              />
            </div>
            {form.formState.errors.phoneNumber && (
              <p className="text-red-600 text-sm mt-1">{form.formState.errors.phoneNumber.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 ml-1 text-md">Password</label>
            <Input
              type="password"
              {...form.register('password')}
              className="h-12 rounded-xl"
              placeholder="*********"
            />
            {form.formState.errors.password && (
              <p className="text-red-600 text-sm mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="h-12 rounded-xl w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Submitting...' : 'Continue'}
          </Button>
        </form>

        <div className="w-full h-[2px] my-6 bg-gray-500/60"></div>

        <Button
          onClick={() => signIn('google', { callbackUrl: '/profile-setup' })}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl"
        >
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
          Sign up with Google
        </Button>

        <div className="mt-4 text-center">
          <span>Already have an account? </span>
          <a href="/login" className="text-blue-600 hover:underline">
            Log in here
          </a>
        </div>
      </div>
    </div>
  );
}