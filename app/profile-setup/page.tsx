'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { User, Calendar, VenusAndMars, ArrowRight, CheckCircle, Sparkles, Star } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  age: z.number().min(1, { message: 'Age must be a positive number.' }),
  gender: z.string().min(1, { message: 'Gender is required.' }),
});

export default function ProfileSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
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
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Profile saved successfully! Welcome to your learning journey! 🎉');
        router.push('/home');
      } else {
        toast.error('Failed to save profile');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Profile</h1>
          <p className="text-gray-600 dark:text-gray-300">Let's personalize your learning experience</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
              currentStep >= 1 ? 'bg-blue-600 text-white scale-110' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              1
            </div>
            <div className={`w-12 h-1 rounded transition-all duration-300 ${
              currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
              currentStep >= 2 ? 'bg-blue-600 text-white scale-110' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              2
            </div>
            <div className={`w-12 h-1 rounded transition-all duration-300 ${
              currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
              currentStep >= 3 ? 'bg-blue-600 text-white scale-110' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Name */}
            <div className={`transition-all duration-500 ${currentStep === 1 ? 'block opacity-100' : 'hidden opacity-0'}`}>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">What's your name?</h2>
                <p className="text-gray-600 dark:text-gray-300">We'll use this to personalize your experience</p>
              </div>
              
              <div>
                <Input
                  {...form.register('name')}
                  className="h-14 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-lg text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your full name"
                  autoFocus
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-2 text-center">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <Button
                type="button"
                onClick={() => {
                  if (form.getValues('name').length >= 2) {
                    setCurrentStep(2);
                  } else {
                    form.trigger('name');
                  }
                }}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg mt-6 transition-all duration-300 hover:scale-105"
              >
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Step 2: Age */}
            <div className={`transition-all duration-500 ${currentStep === 2 ? 'block opacity-100' : 'hidden opacity-0'}`}>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">How old are you?</h2>
                <p className="text-gray-600 dark:text-gray-300">This helps us recommend age-appropriate content</p>
              </div>
              
              <div>
                <Input
                  type="number"
                  {...form.register('age', { valueAsNumber: true })}
                  className="h-14 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400 text-lg text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your age"
                  autoFocus
                />
                {form.formState.errors.age && (
                  <p className="text-red-500 text-sm mt-2 text-center">{form.formState.errors.age.message}</p>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 h-14 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (form.getValues('age') > 0) {
                      setCurrentStep(3);
                    } else {
                      form.trigger('age');
                    }
                  }}
                  className="flex-1 h-14 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
                >
                  Continue <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>

            {/* Step 3: Gender */}
            <div className={`transition-all duration-500 ${currentStep === 3 ? 'block opacity-100' : 'hidden opacity-0'}`}>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <VenusAndMars className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">What's your gender?</h2>
                <p className="text-gray-600 dark:text-gray-300">This helps us provide relevant content</p>
              </div>
              
              <div className="space-y-3">
                {['Male', 'Female', 'Other', 'Prefer not to say'].map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => form.setValue('gender', gender)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105 ${
                      form.watch('gender') === gender
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{gender}</span>
                      {form.watch('gender') === gender && (
                        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  </button>
                ))}
                {form.formState.errors.gender && (
                  <p className="text-red-500 text-sm mt-2 text-center">{form.formState.errors.gender.message}</p>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 h-14 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-14 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Setup <CheckCircle className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>You can update these details anytime in your profile settings</span>
            <Star className="w-4 h-4 text-yellow-500" />
          </div>
        </div>
      </div>
    </div>
  );
}