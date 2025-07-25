'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { toast } from 'sonner';


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  age: z.number().min(1, { message: 'Age must be a positive number.' }),
  gender: z.string().min(1, { message: 'Gender is required.' }),
});

export default function ProfileSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: session?.user?.name || '',
      age: 0,
      gender: '',
    },
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const res = await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
      credentials: 'include',
    });

    if (res.ok) {
      toast.success('Profile saved successfully!');
      router.push('/home');
    } else {
      toast.error('Failed to save profile');
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full flex justify-center items-center h-screen">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-1/3">
        <div>
          <label className="mb-1 ml-1 text-md">Name</label>
          <Input {...form.register('name')} className="h-12 rounded-xl" />
          {form.formState.errors.name && (
            <p className="text-red-600 text-sm">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 ml-1 text-md">Age</label>
          <Input
            type="number"
            {...form.register('age', { valueAsNumber: true })}
            className="h-12 rounded-xl"
          />
          {form.formState.errors.age && (
            <p className="text-red-600 text-sm">{form.formState.errors.age.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 ml-1 text-md">Gender</label>
          <Input {...form.register('gender')} className="h-12 rounded-xl" />
          {form.formState.errors.gender && (
            <p className="text-red-600 text-sm">{form.formState.errors.gender.message}</p>
          )}
        </div>
        <Button type="submit" className="h-12 rounded-xl w-full">
          Save Profile
        </Button>
      </form>
    </div>
  );
}