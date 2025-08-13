'use client'
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language';
import LangToggle from '@/components/LangToggle';
import Beams from '@/components/Beams/Beams';
import { 
  BookOpen, 
  GraduationCap, 
  Brain, 
  User, 
  Star, 
  Stethoscope,
  CheckCircle,
  ArrowRight,
  Users,
  Award,
  Target,
  TrendingUp
} from 'lucide-react';

export default function LandingPage() {
  const { t, language } = useLanguage();
  
  // Use centralized translations
  const t_landing = (key: string) => {
    return t(key);
  };

  const steps = [
    {
      icon: <User className="w-8 h-8 text-blue-600" />,
      title: t_landing('step1Title'),
      description: t_landing('step1Desc')
    },
    {
      icon: <Brain className="w-8 h-8 text-emerald-600" />,
      title: t_landing('step2Title'),
      description: t_landing('step2Desc')
    },
    {
      icon: <Award className="w-8 h-8 text-purple-600" />,
      title: t_landing('step3Title'),
      description: t_landing('step3Desc')
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
      title: t_landing('step4Title'),
      description: t_landing('step4Desc')
    }
  ];

  const benefits = [
    {
      icon: <Target className="w-6 h-6 text-blue-600" />,
      title: t_landing('benefit1Title'),
      description: t_landing('benefit1Desc')
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
      title: t_landing('benefit2Title'),
      description: t_landing('benefit2Desc')
    },
    {
      icon: <Users className="w-6 h-6 text-purple-600" />,
      title: t_landing('benefit3Title'),
      description: t_landing('benefit3Desc')
    }
  ];

  const assessmentTypes = [
    {
      icon: <User className="w-8 h-8 text-blue-600" />,
      title: t_landing('personalityTitle'),
      description: t_landing('personalityDesc'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Brain className="w-8 h-8 text-emerald-600" />,
      title: t_landing('aptitudeTitle'),
      description: t_landing('aptitudeDesc'),
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: <Star className="w-8 h-8 text-purple-600" />,
      title: t_landing('competencyTitle'),
      description: t_landing('competencyDesc'),
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-orange-600" />,
      title: t_landing('careerTitle'),
      description: t_landing('careerDesc'),
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="h-1/2 md:min-h-screen relative">
      {/* ReactBits Beams Background */}
      <div className="fixed inset-0 -z-10 h-1/2 md:h-screen">
        <Beams 
          beamWidth={3.5}
          beamHeight={30}
          beamNumber={8}
          lightColor="#3b82f6"
          speed={1.5}
          noiseIntensity={1.2}
          scale={0.15}
          rotation={15}
        />
      </div>
      
      {/* Content */}
      <div className="h-full relative z-10">
        {/* Header */}
        <header className=" relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex sm:flex-row justify-between items-center py-4 sm:py-6 gap-4 sm:gap-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-white" /> <span>logo</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">TestCenter</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-center sm:justify-end">
                <LangToggle />
                <Button 
                  variant="ghost" 
                                     className="inline-flex items-center gap-2 justify-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-sm sm:text-base px-3 sm:px-4 py-2"
                  onClick={() => window.location.href = '/login'}
                >
                  <span className='text-sm sm:text-md font-semibold'>{t('login')}</span>
                  <User className="w-4 h-4 sm:w-5 sm:h-5 inline-block" />
                </Button>
                <Button 
                  className="inline-flex items-center gap-2 justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 backdrop-blur-sm text-sm sm:text-base px-3 sm:px-4 py-2"
                  onClick={() => window.location.href = '/signup'}
                >
                  <span className='text-sm sm:text-md font-semibold'>{t('createAccount')}</span>
                  <User className="w-4 h-4 sm:w-5 sm:h-5 inline-block" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="h-2/3 md:min-h-screen relative py-16 sm:py-20 lg:py-32 flex items-center">
          <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight px-2">
              {t_landing('heroTitle')}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              {t_landing('heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"> 
              <Button 
                size="lg" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 backdrop-blur-sm shadow-lg"
                onClick={() => window.location.href = '/sign-up'}
              >
                <span className='text-sm sm:text-md font-semibold'>{t_landing('heroCTA')}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 inline-block" />
              </Button>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto inline-flex items-center justify-center text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border-2 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
                  {t_landing('heroSecondary')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-50/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t_landing('howItWorks')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t('secureRegistrationDesc')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-gray-100/70 dark:bg-gray-900/70 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t_landing('whyChooseUs')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white/80 dark:bg-gray-800/80 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm border border-gray-200/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Assessment Types */}
        <section className="py-16 sm:py-20 bg-gray-50/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-2">
                {t_landing('assessmentTypes')}
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {assessmentTypes.map((type, index) => (
                <div key={index} className="group">
                  <div className={`bg-gradient-to-r ${type.color} p-6 sm:p-8 rounded-xl text-white transform group-hover:scale-105 transition-transform duration-300 shadow-lg backdrop-blur-sm`}>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                      {type.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                      {type.title}
                    </h3>
                    <p className="text-sm sm:text-base text-white/90">
                      {type.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
          {/* Additional beam effects for CTA */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90" />
          <div className="absolute top-0 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-40 sm:w-80 h-40 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
              {t_landing('ctaTitle')}
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 px-4">
              {t_landing('ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button 
                size="lg" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 backdrop-blur-sm shadow-lg"
                onClick={() => window.location.href = '/signup'}
              >
                <span className='text-sm sm:text-md font-semibold'>{t_landing('signUp')}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 inline-block" />
              </Button>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto inline-flex items-center justify-center text-white border-white hover:bg-white/10 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 backdrop-blur-sm">
                  {t_landing('login')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        
      </div>
    </div>
  );
}
