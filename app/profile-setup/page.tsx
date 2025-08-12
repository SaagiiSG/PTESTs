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
import { User, Calendar, VenusAndMars, ArrowRight, CheckCircle, Sparkles, Star, GraduationCap, Users, Briefcase, BookOpen, Heart } from 'lucide-react';
import { useLanguage } from '@/lib/language';
import { Card, CardContent } from '@/components/ui/card';
import Silk from '@/components/Silk/Silk';
import LangToggle from '@/components/LangToggle';

const formSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  dateOfBirth: z.string().min(1, { message: 'Date of birth is required.' }),
  gender: z.string().min(1, { message: 'Gender is required.' }),
  education: z.string().min(1, { message: 'Education is required.' }),
  family: z.string().min(1, { message: 'Family information is required.' }),
  position: z.string().min(1, { message: 'Position/Major is required.' }),
});

export default function ProfileSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { t } = useLanguage();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      education: '',
      family: '',
      position: '',
    },
  });

  // Do not require authentication here; allow unauthenticated users to complete basic profile
  // If you still want to prefill from session when available, we rely on default values above.

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Include identifiers so unauthenticated first-time users can be matched server-side
      const email = (session as any)?.user?.email || (typeof window !== 'undefined' ? localStorage.getItem('signupEmail') : null);
      const phoneNumber = (session as any)?.user?.phoneNumber || (typeof window !== 'undefined' ? localStorage.getItem('signupPhoneNumber') : null);

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          // Combine first and last name for the full name
          name: `${values.firstName} ${values.lastName}`.trim(),
          // pass identifiers only if present
          ...(email ? { email } : {}),
          ...(phoneNumber ? { phoneNumber } : {}),
        }),
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(t('profileSaved'));
        // Always redirect to login to ensure a clean authenticated session before landing on home
        router.push('/login?callbackUrl=%2Fhome');
      } else if (res.status === 401) {
        toast.info('Please log in to save your profile. Redirecting to login...');
        router.push('/login?callbackUrl=%2Fprofile-setup');
        return;
      } else {
        try {
          const data = await res.json();
          toast.error(data?.message || 'Failed to save profile');
        } catch (_) {
          toast.error('Failed to save profile');
        }
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 7; // Increased to 7 steps now

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">{t('loading')}</p>
        </div>
      </div>
    );
  }

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
                color="#10B981" 
                noiseIntensity={1.6} 
                rotation={-0.05}
              />
            </div>         
            <div className="flex flex-col justify-end pb-6 relative p-8 lg:p-12 rounded-r-3xl bg-white/10 border border-white/20 shadow-2xl z-10 h-full">
             
              <div className="relative z-10 text-center lg:text-left">
                <div className="mb-8">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl flex items-center justify-center mx-auto lg:mx-0 shadow-lg">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                    {t('completeYourProfile')}
                  </h1>
                  <p className="text-xl text-white/90 mb-6 drop-shadow-md">
                    {t('personalizeExperience')}
                  </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center lg:justify-start mb-8">
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: totalSteps }, (_, i) => (
                      <div key={i} className="flex items-center">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
                          currentStep > i + 1 ? 'bg-emerald-500 text-white' :
                          currentStep === i + 1 ? 'bg-teal-600 text-white scale-110' : 
                          'bg-white/20 text-white/60'
                        }`}>
                          {currentStep > i + 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                        </div>
                        {i < totalSteps - 1 && (
                          <div className={`w-8 h-1 rounded transition-all duration-300 ${
                            currentStep > i + 1 ? 'bg-emerald-500' : 'bg-white/20'
                          }`}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 40% - Form Inputs */}
          <div className="w-full h-full flex flex-col justify-center relative items-center lg:w-[40%] pr-6">
            <div className="absolute top-4 right-4">
              <LangToggle />
            </div>
            <Card className="w-full flex flex-col justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl rounded-3xl">
              <CardContent className="p-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Step 1: First Name */}
                  <div className={`transition-all duration-500 ${currentStep === 1 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('whatsYourFirstName')}</h2>
                      <p className="text-gray-600 dark:text-gray-300">{t('personalizeWithFirstName')}</p>
                    </div>
                    
                    <div>
                      <Input
                        {...form.register('firstName')}
                        className="h-14 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 text-lg text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={t('enterFirstName')}
                        autoFocus
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-red-500 text-sm mt-2 text-center">{form.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    
                    <Button
                      type="button"
                      onClick={() => {
                        if (form.getValues('firstName').length >= 2) {
                          setCurrentStep(2);
                        } else {
                          form.trigger('firstName');
                        }
                      }}
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-lg mt-6 transition-all duration-300 hover:scale-105"
                    >
                      {t('continue')} <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>

                  {/* Step 2: Last Name */}
                  <div className={`transition-all duration-500 ${currentStep === 2 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <User className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('whatsYourLastName')}</h2>
                      <p className="text-gray-600 dark:text-gray-300">{t('personalizeWithLastName')}</p>
                    </div>
                    
                    <div>
                      <Input
                        {...form.register('lastName')}
                        className="h-14 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-teal-500 dark:focus:border-teal-400 text-lg text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={t('enterLastName')}
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-red-500 text-sm mt-2 text-center">{form.formState.errors.lastName.message}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 h-14 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {t('back')}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (form.getValues('lastName').length >= 2) {
                            setCurrentStep(3);
                          } else {
                            form.trigger('lastName');
                          }
                        }}
                        className="flex-1 h-14 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
                      >
                        {t('continue')} <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Step 3: Date of Birth */}
                  <div className={`transition-all duration-500 ${currentStep === 3 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('whenWereYouBorn')}</h2>
                      <p className="text-gray-600 dark:text-gray-300">{t('ageAppropriateContent')}</p>
                    </div>
                    
                    <div>
                      <Input
                        type="date"
                        {...form.register('dateOfBirth')}
                        className="h-14 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 text-lg text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        autoFocus
                      />
                      {form.formState.errors.dateOfBirth && (
                        <p className="text-red-500 text-sm mt-2 text-center">{form.formState.errors.dateOfBirth.message}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                        className="flex-1 h-14 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {t('back')}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (form.getValues('dateOfBirth')) {
                            setCurrentStep(4);
                          } else {
                            form.trigger('dateOfBirth');
                          }
                        }}
                        className="flex-1 h-14 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
                      >
                        {t('continue')} <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Step 4: Gender */}
                  <div className={`transition-all duration-500 ${currentStep === 4 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <VenusAndMars className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('whatsYourGender')}</h2>
                      <p className="text-gray-600 dark:text-gray-300">{t('relevantContent')}</p>
                    </div>
                    
                    <div className="space-y-3">
                      {[t('male'), t('female'), t('other'), t('preferNotToSay')].map((gender) => (
                        <button
                          key={gender}
                          type="button"
                          onClick={() => form.setValue('gender', gender)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105 ${
                            form.watch('gender') === gender
                              ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{gender}</span>
                            {form.watch('gender') === gender && (
                              <CheckCircle className="w-5 h-5 text-pink-600 dark:text-pink-400" />
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
                        onClick={() => setCurrentStep(3)}
                        className="flex-1 h-14 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {t('back')}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (form.getValues('gender')) {
                            setCurrentStep(5);
                          } else {
                            form.trigger('gender');
                          }
                        }}
                        className="flex-1 h-14 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
                      >
                        {t('continue')} <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Step 5: Education */}
                  <div className={`transition-all duration-500 ${currentStep === 5 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('whatsYourEducation')}</h2>
                      <p className="text-gray-600 dark:text-gray-300">{t('tailorContent')}</p>
                    </div>
                    
                    <div className="space-y-3">
                      {[t('highSchool'), t('bachelorsDegree'), t('mastersDegree'), t('phd'), t('other')].map((education) => (
                        <button
                          key={education}
                          type="button"
                          onClick={() => form.setValue('education', education)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105 ${
                            form.watch('education') === education
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{education}</span>
                            {form.watch('education') === education && (
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                        </button>
                      ))}
                      {form.formState.errors.education && (
                        <p className="text-red-500 text-sm mt-2 text-center">{form.formState.errors.education.message}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(4)}
                        className="flex-1 h-14 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {t('back')}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (form.getValues('education')) {
                            setCurrentStep(6);
                          } else {
                            form.trigger('education');
                          }
                        }}
                        className="flex-1 h-14 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
                      >
                        {t('continue')} <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Step 6: Family */}
                  <div className={`transition-all duration-500 ${currentStep === 6 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('tellUsAboutFamily')}</h2>
                      <p className="text-gray-600 dark:text-gray-300">{t('understandBackground')}</p>
                    </div>
                    
                    <div className="space-y-3">
                      {[t('single'), t('married'), t('marriedWithChildren'), t('divorced'), t('widowed'), t('other')].map((family) => (
                        <button
                          key={family}
                          type="button"
                          onClick={() => form.setValue('family', family)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105 ${
                            form.watch('family') === family
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{family}</span>
                            {form.watch('family') === family && (
                              <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            )}
                          </div>
                        </button>
                      ))}
                      {form.formState.errors.family && (
                        <p className="text-red-500 text-sm mt-2 text-center">{form.formState.errors.family.message}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(5)}
                        className="flex-1 h-14 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {t('back')}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (form.getValues('family')) {
                            setCurrentStep(7);
                          } else {
                            form.trigger('family');
                          }
                        }}
                        className="flex-1 h-14 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
                      >
                        {t('continue')} <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Step 7: Position/Major */}
                  <div className={`transition-all duration-500 ${currentStep === 7 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('whatsYourPosition')}</h2>
                      <p className="text-gray-600 dark:text-gray-300">{t('recommendCourses')}</p>
                    </div>
                    
                    <div>
                      <Input
                        {...form.register('position')}
                        className="h-14 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-lg text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={t('positionPlaceholder')}
                        autoFocus
                      />
                      {form.formState.errors.position && (
                        <p className="text-red-500 text-sm mt-2 text-center">{form.formState.errors.position.message}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(6)}
                        className="flex-1 h-14 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {t('back')}
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            {t('saving')}
                          </>
                        ) : (
                          <>
                            {t('completeSetup')} <CheckCircle className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Footer */}
                <div className="text-center mt-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{t('updateDetailsAnytime')}</span>
                    <Star className="w-4 h-4 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}