'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Search } from 'lucide-react';
import CourseCard from '@/components/home/CourseCard';
import CourseCardSkeleton from '@/components/home/CourseCardSkeleton';
import TestCards from '@/components/home/TestCards';
import api from '@/lib/axios';
import Link from 'next/link';
import LangToggle from '@/components/LangToggle';
import { useLanguage } from '@/lib/language';
import { BookOpen, GraduationCap } from 'lucide-react';

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
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'tests'>('courses');
  const [testSearch, setTestSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [tests, setTests] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [purchasedCourses, setPurchasedCourses] = useState<any[]>([]);
  const [loadingPurchasedCourses, setLoadingPurchasedCourses] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setLoadingTests(true);
    setLoadingCourses(true);
    setLoadingUser(true);
    setLoadingPurchasedCourses(true);
    api.get('/api/profile/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
    Promise.all([
      fetchProtectedTestsClient().then((data) => { setTests(data); setLoadingTests(false); }),
      fetchCoursesClient().then((data) => { setCourses(data); setLoadingCourses(false); }),
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
    ]);
  }, []);

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
    if (!testSearch) return tests;
    const s = testSearch.toLowerCase();
    return tests.filter(
      t =>
        t.title?.toLowerCase().includes(s) ||
        t.description?.en?.toLowerCase().includes(s) ||
        t.description?.mn?.toLowerCase().includes(s)
    );
  }, [testSearch, tests]);

  // Sort by takenCount descending for tests
  const sortedTests = useMemo(() => {
    return [...filteredTests].sort((a, b) => (b.takenCount || 0) - (a.takenCount || 0));
  }, [filteredTests]);

  return (
    <div className='w-full h-auto flex flex-col gap-6 pb-8 mt-8'>
      {/* Header with Language Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-gray-800">
            {loadingUser ? t('loading') : user ? `${t('welcomeBack')}, ${user.name}!` : t('welcomeBack')}
          </h1>
          <p className="text-gray-500 text-sm">Ready to continue your learning journey?</p>
        </div>
      </div>

      <div className='w-full h-auto flex flex-col lg:flex-row gap-6'>
        {/* Left Column - 30% */}
        <div className="w-full lg:w-[30%] flex flex-col gap-4">
          {/* Continue Purchased Course Section */}
          <div>
            <h2 className="text-lg font-semibold mb-3">{t('continueLearning')}</h2>
            {loadingPurchasedCourses ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <CourseCardSkeleton key={i} />)}
              </div>
            ) : purchasedCourses.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {purchasedCourses.map((purchasedCourse, index) => {
                  const course = purchasedCourse.course;
                  if (!course) return null;
                  
                  return (
                    <div key={course._id || index} className="bg-white rounded-lg shadow border p-3 hover:shadow-md transition-shadow">
                      {/* Mobile Layout - Compact Horizontal */}
                      <div className="lg:hidden flex flex-row items-center gap-3">
                        <img
                          src={course.thumbnailUrl || '/ppnim_logo.svg'}
                          alt={course.title}
                          className="w-12 h-12 object-cover rounded border flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="font-semibold text-sm truncate mb-0.5">{course.title}</div>
                          <div className="text-xs text-gray-500">{course.lessons?.length || 0} lessons</div>
                        </div>
                        <Link href={`/Course/${course._id}/lesson/0`}>
                          <Button size="sm" className="bg-yellow-500 text-white hover:bg-yellow-600 px-2 py-1 text-xs whitespace-nowrap rounded-full shadow-none">
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
                            className="w-16 h-16 object-cover rounded-lg border flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1">{course.title}</h3>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{course.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{course.lessons?.length || 0} {t('lessons')}</span>
                              <Link href={`/Course/${course._id}/lesson/0`}>
                                <Button size="sm" className="bg-yellow-500 text-white hover:bg-yellow-600 px-3 py-1 text-xs rounded-full shadow-none">
                                  {t('continueLearning')}
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 p-4 bg-gray-50 rounded-lg border text-center">
                <p className="text-sm">{t('noPurchasedCourses')}</p>
                <p className="text-xs mt-1">{t('startLearning')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - 70% */}
        <div className="w-full lg:w-[70%] flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex gap-1 mb-2">
            <Button
              variant={activeTab === 'courses' ? 'default' : 'outline'}
              onClick={() => setActiveTab('courses')}
              className={`rounded-full px-4 py-1 text-sm ${activeTab === 'courses' ? 'font-semibold' : ''}`}
            >
              <GraduationCap />
              {t('courses')}
             
            </Button>
            <Button
              variant={activeTab === 'tests' ? 'default' : 'outline'}
              onClick={() => setActiveTab('tests')}
              className={`rounded-full px-4 py-1 text-sm ${activeTab === 'tests' ? 'font-semibold' : ''}`}
            >
              <BookOpen />
              {t('tests')}
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === 'courses' ? (
            <section>
              <div className='flex gap-2 p-2 px-3 text-[15px] rounded-xl bg-gray-200 shadow mb-4'>
                <Search />
                <input
                  type="text"
                  placeholder={`${t('search')} for courses`}
                  className='outline-0 bg-gray-200 flex-1 text-sm '
                  value={courseSearch}
                  onChange={e => setCourseSearch(e.target.value)}
                />
              </div>
              {loadingCourses ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => <CourseCardSkeleton key={i} />)}
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-gray-500">{t('noCoursesFound')}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course._id}
                      _id={course._id}
                      title={course.title}
                      description={course.description}
                      lessonCount={course.lessons?.length || 0}
                      price={course.price}
                      thumbnailUrl={course.thumbnailUrl}
                      lessons={course.lessons}
                      compact
                    />
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section>
              <div className='flex gap-2 p-2 px-3 text-[15px] rounded-xl bg-gray-200 shadow mb-4'>
                <Search />
                <input
                  type="text"
                  placeholder={`${t('search')} for tests`}
                  className='outline-0 bg-gray-200 flex-1 text-sm'
                  value={testSearch}
                  onChange={e => setTestSearch(e.target.value)}
                />
              </div>
              <div className='w-full flex flex-wrap gap-4'>
                {loadingTests ? (
                  <div className='w-full flex flex-wrap gap-4'>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-full max-w-sm"><div className="h-32 bg-gray-200 rounded-xl animate-pulse" /></div>
                    ))}
                  </div>
                ) : sortedTests.length === 0 ? (
                  <div className="text-gray-500">{t('noTestsFound')}</div>
                ) : (
                  sortedTests.map((test: any, index: number) => (
                    <TestCards
                      key={test._id || index}
                      hr={test.title}
                      shortDes={test.description?.en}
                      slug={test.id}
                      thumbnailUrl={test.thumbnailUrl || "/ppnim_logo.svg"}
                      price={test.price}
                      variant={isMobile ? 'big' : 'small'}
                    />
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
