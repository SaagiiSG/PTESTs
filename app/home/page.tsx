'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Search } from 'lucide-react';
import CourseCard from '@/components/home/CourseCard';
import CourseCardSkeleton from '@/components/home/CourseCardSkeleton';
import TestCard from '@/components/testCard';
import TestCardSkeleton from '@/components/home/TestCardsSkeleton';
import api from '@/lib/axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LangToggle from '@/components/LangToggle';
import { useLanguage } from '@/lib/language';
import { getLocalizedTitle } from '@/lib/utils';
import { BookOpen, GraduationCap, Star, Brain, Stethoscope, User } from 'lucide-react';

async function fetchProtectedTestsClient() {
  const res = await fetch('/api/protected-tests');
  if (!res.ok) {
    const text = await res.text();
    console.error("API error (tests):", res.status, text);
    return [];
  }
  return res.json();
}

async function fetchCoursesClient() {
  const res = await fetch('/api/courses');
  if (!res.ok) {
    const text = await res.text();
    console.error("API error (courses):", res.status, text);
    return [];
  }
  return res.json();
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'tests'>('tests');
  const [testSearch, setTestSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedTestType, setSelectedTestType] = useState<string>('all');
  const [tests, setTests] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [purchasedCourses, setPurchasedCourses] = useState<any[]>([]);
  const [loadingPurchasedCourses, setLoadingPurchasedCourses] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const { t, language } = useLanguage();

  // Check if user profile is complete
  const isProfileComplete = (user: any) => {
    if (!user) return false;
    
    // Admin users don't need to complete the same profile setup as regular users
    if (user.isAdmin) {
      return true; // Admin users are considered complete
    }
    
    // Regular users need name, dateOfBirth, gender, education, family, and position
    return user.name && user.dateOfBirth && user.gender && user.education && user.family && user.position;
  };

  useEffect(() => {
    setLoadingTests(true);
    setLoadingCourses(true);
    setLoadingUser(true);
    setLoadingPurchasedCourses(true);
    api.get('/api/profile/me')
      .then(res => {
        const userData = res.data;
        setUser(userData);
        
        // Check if profile is complete, if not redirect to profile setup
        if (userData && !isProfileComplete(userData)) {
          router.push('/profile-setup');
          return;
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
    Promise.all([
      fetchProtectedTestsClient().then((data) => { 
        console.log('📊 Tests loaded:', data.length, 'tests');
        setTests(data); 
        setLoadingTests(false); 
      }),
      fetchCoursesClient().then((data) => { 
        console.log('📚 Courses loaded:', data.length, 'courses');
        console.log('🖼️ Course thumbnails:', data.map((c: any) => ({ title: c.title, thumbnailUrl: c.thumbnailUrl })));
        setCourses(data); 
        setLoadingCourses(false); 
      }),
      api.get('/api/profile/purchased-courses').then(res => { 
        // Handle the new API response format
        const data = res.data;
        if (data && data.courses && Array.isArray(data.courses)) {
          setPurchasedCourses(data.courses);
        } else if (data && data.course) {
          // Fallback for old format
          setPurchasedCourses([data]);
        } else {
          setPurchasedCourses([]);
        }
        setLoadingPurchasedCourses(false); 
      }).catch(() => {
        setPurchasedCourses([]);
        setLoadingPurchasedCourses(false);
      }),
    ]).then(() => {
      // Set content as loaded after all data is fetched
      setTimeout(() => setContentLoaded(true), 100);
    });
  }, [router]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Courses filtering
  const filteredCourses = useMemo(() => {
    if (!courseSearch) return courses;
    const s = courseSearch.toLowerCase();
    return courses.filter(
      c =>
        c.title?.toLowerCase().includes(s) ||
        c.description?.toLowerCase().includes(s)
    );
  }, [courseSearch, courses]);

  // Tests filtering
  const filteredTests = useMemo(() => {
    let filtered = tests;
    
    // Filter by search term
    if (testSearch) {
      const s = testSearch.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.title?.toLowerCase().includes(s) ||
          t.description?.en?.toLowerCase().includes(s) ||
          t.description?.mn?.toLowerCase().includes(s)
      );
    }
    
    // Filter by test type (only if testType is set and not 'all')
    if (selectedTestType && selectedTestType !== 'all') {
      filtered = filtered.filter(t => t.testType === selectedTestType);
    }
    
    return filtered;
  }, [testSearch, selectedTestType, tests]);

  // Sort by takenCount descending for tests
  const sortedTests = useMemo(() => {
    return [...filteredTests].sort((a, b) => (b.takenCount || 0) - (a.takenCount || 0));
  }, [filteredTests]);

  return (
    <div className='w-full h-auto flex flex-col gap-6 pb-8 mt-8 page-transition'>
      {/* Show loading state while checking profile completeness */}
      {loadingUser ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading your profile...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header with Language Toggle */}
          <div className="flex justify-between items-center fade-in">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                {user ? `${t('welcomeBack')}, ${user.name}!` : t('welcomeBack')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Ready to continue your learning journey?</p>
            </div>
          </div>

          <div className='w-full h-auto flex flex-col lg:flex-row gap-6'>
            {/* Left Column - 30% */}
            <div className="w-full lg:w-[30%] flex flex-col gap-4">
              {/* Continue Purchased Course Section */}
              <div className="fade-in">
                <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">{t('continueLearning')}</h2>
                {loadingPurchasedCourses ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="stagger-item">
                        <CourseCardSkeleton />
                      </div>
                    ))}
                  </div>
                ) : purchasedCourses.length > 0 ? (
                  <div className="space-y-3 max-h-96 ">
                    {purchasedCourses.map((purchasedCourse, index) => {
                      const course = purchasedCourse.course;
                      if (!course) return null;
                      
                      return (
                        <div key={course._id || index} className="stagger-item">
                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-3 hover:shadow-md transition-all duration-300 card-hover">
                            {/* Mobile Layout - Compact Horizontal */}
                            <div className="lg:hidden flex flex-row items-center gap-3">
                              <img
                                src={course.thumbnailUrl || '/ppnim_logo.svg'}
                                alt={course.title}
                                className="w-12 h-12 object-cover rounded border dark:border-gray-600 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="font-semibold text-sm truncate mb-0.5 text-gray-800 dark:text-white">{course.title}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{course.lessons?.length || 0} lessons</div>
                              </div>
                              <Link href={`/Course/${course._id}/lesson/0`}>
                                <Button size="sm" variant="gradientYellow" className="px-2 py-1 text-xs whitespace-nowrap rounded-full">
                                  {t('continue')}
                                </Button>
                              </Link>
                            </div>

                            {/* Desktop Layout - Compact Card */}
                            <div className="hidden lg:flex flex-col gap-3">
                              <div className="flex items-start gap-3">
                                <img
                                  src={course.thumbnailUrl || '/ppnim_logo.svg'}
                                  alt={course.title}
                                  className="w-16 h-16 object-cover rounded-lg border dark:border-gray-600 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1 line-clamp-1">{course.title}</h3>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{course.description}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{course.lessons?.length || 0} {t('lessons')}</span>
                                    <Link href={`/Course/${course._id}/lesson/0`}>
                                      <Button size="sm" variant="gradientYellow" className="px-3 py-1 text-xs rounded-full">
                                        {t('continueLearning')}
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 text-center">
                    <p className="text-sm">{t('noPurchasedCourses')}</p>
                    <p className="text-xs mt-1">{t('startLearning')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - 70% */}
            <div className="w-full lg:w-[70%] flex flex-col gap-4">
              {/* Tabs */}
              <div className="flex mb-2 fade-in gap-2">
                
                <Button
                  variant={activeTab === 'tests' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('tests')}
                  className={`tab-item rounded-full px-4 py-1 text-sm ${activeTab === 'tests' ? 'active font-semibold' : ''}`}
                >
                  <span className="flex flex-row items-center justify-center gap-2">
                    <BookOpen />
                    {t('tests')}
                  </span>
                </Button>

                <Button
                  variant={activeTab === 'courses' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('courses')}
                  className={`tab-item rounded-full px-4 py-1 text-sm ${activeTab === 'courses' ? 'active font-semibold' : ''}`}
                >
                  <span className="flex flex-row items-center justify-center gap-2">
                    <GraduationCap />
                    {t('courses')}
                  </span>
                </Button>
              </div>

              {/* Tab Content */}
              {activeTab === 'courses' ? (
                <section className="fade-in">
                  <div className='flex gap-2 p-2 px-3 text-[15px] rounded-xl bg-gray-200 dark:bg-gray-700 shadow mb-4 search-input'>
                    <Search className="text-gray-500 dark:text-gray-400" />
                    <input
                      type="text"
                      placeholder={`${t('search')} for courses`}
                      className='outline-0 bg-transparent flex-1 text-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
                      value={courseSearch}
                      onChange={e => setCourseSearch(e.target.value)}
                    />
                  </div>
                  {loadingCourses ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="stagger-item">
                          <CourseCardSkeleton />
                        </div>
                      ))}
                    </div>
                  ) : filteredCourses.length === 0 ? (
                    <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p>{t('noCoursesFound')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredCourses.map((course, index) => (
                        <div key={course._id} className="stagger-item">
                          <CourseCard
                            _id={course._id}
                            title={course.title}
                            description={course.description}
                            lessonCount={course.lessons?.length || 0}
                            price={course.price}
                            thumbnailUrl={course.thumbnailUrl}
                            lessons={course.lessons}
                            compact
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ) : (
                <section className="fade-in">
                  <div className='flex gap-2 p-2 px-3 text-[15px] rounded-xl bg-gray-200 dark:bg-gray-700 shadow mb-4 search-input'>
                    <Search className="text-gray-500 dark:text-gray-400" />
                    <input
                      type="text"
                      placeholder={`${t('search')} for tests`}
                      className='outline-0 bg-transparent flex-1 text-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
                      value={testSearch}
                      onChange={e => setTestSearch(e.target.value)}
                    />
                  </div>
                  
                  {/* Test Type Filter */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setSelectedTestType('all')}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105 active:scale-95 ${
                        selectedTestType === 'all'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
                      }`}
                    >
                      <BookOpen className={`w-4 h-4 ${selectedTestType === 'all' ? 'text-white' : 'text-blue-500'}`} />
                      {t('allTypes')}
                    </button>
                    <button
                      onClick={() => setSelectedTestType('Talent')}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105 active:scale-95 ${
                        selectedTestType === 'Talent'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${selectedTestType === 'Talent' ? 'text-white' : 'text-blue-500'}`} />
                      {t('talent')}
                    </button>
                    <button
                      onClick={() => setSelectedTestType('Aptitude')}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105 active:scale-95 ${
                        selectedTestType === 'Aptitude'
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-lg'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
                      }`}
                    >
                      <Brain className={`w-4 h-4 ${selectedTestType === 'Aptitude' ? 'text-white' : 'text-emerald-500'}`} />
                      {t('aptitude')}
                    </button>
                    <button
                      onClick={() => setSelectedTestType('Clinic')}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105 active:scale-95 ${
                        selectedTestType === 'Clinic'
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500 shadow-lg'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
                      }`}
                    >
                      <Stethoscope className={`w-4 h-4 ${selectedTestType === 'Clinic' ? 'text-white' : 'text-purple-500'}`} />
                      {t('clinic')}
                    </button>
                    <button
                      onClick={() => setSelectedTestType('Personality')}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105 active:scale-95 ${
                        selectedTestType === 'Personality'
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500 shadow-lg'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
                      }`}
                    >
                      <User className={`w-4 h-4 ${selectedTestType === 'Personality' ? 'text-white' : 'text-orange-500'}`} />
                      {t('personality')}
                    </button>
                  </div>
                  <div className='w-full flex flex-col gap-4'>
                    {loadingTests ? (
                      <div className='w-full flex flex-wrap gap-4'>
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="stagger-item">
                            <TestCardSkeleton variant={isMobile ? 'big' : 'small'} />
                          </div>
                        ))}
                      </div>
                    ) : sortedTests.length === 0 ? (
                      <div className="text-gray-500 dark:text-gray-400 text-center py-8 w-full">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p>{t('noTestsFound')}</p>
                      </div>
                    ) : (
                      sortedTests.map((test: any, index: number) => (
                        <div key={test.id || index} className="stagger-item">
                          <TestCard
                            _id={test.id}
                            title={getLocalizedTitle(test.title, language)}
                            description={test.description}
                            slug={test.id}
                            thumbnailUrl={test.thumbnailUrl}
                            price={test.price}
                            variant={isMobile ? 'big' : 'small'}
                            testType={test.testType}
                            takenCount={test.takenCount}
                            questionCount={test.questions?.length}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
