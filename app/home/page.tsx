'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Search } from 'lucide-react';
import CourseCard from '@/components/home/CourseCard';
import CourseCardSkeleton from '@/components/home/CourseCardSkeleton';
import TestCards from '@/components/home/TestCards';
import api from '@/lib/axios';
import Link from 'next/link';

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
  const [recentCourse, setRecentCourse] = useState<any>(null);
  const [loadingRecentCourse, setLoadingRecentCourse] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setLoadingTests(true);
    setLoadingCourses(true);
    setLoadingUser(true);
    setLoadingRecentCourse(true);
    api.get('/api/profile/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
    Promise.all([
      fetchProtectedTestsClient().then((data) => { setTests(data); setLoadingTests(false); }),
      fetchCoursesClient().then((data) => { setCourses(data); setLoadingCourses(false); }),
      api.get('/api/profile/purchased-courses').then(res => { setRecentCourse(res.data); setLoadingRecentCourse(false); }).catch(() => setLoadingRecentCourse(false)),
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
    <div className='w-full h-auto flex flex-col gap-3 pb-8'>
      {/* Welcome Section */}
      <div className="flex flex-col gap-1 mt-8 mb-2">
        <h1 className="text-xl font-semibold text-gray-800">
          {loadingUser ? 'Loading...' : user ? `Welcome back, ${user.name}!` : 'Welcome!'}
        </h1>
        <p className="text-gray-500 text-sm">Ready to continue your learning journey?</p>
      </div>

      {/* Continue Purchased Course Section */}
      <div>
        <h2 className="text-lg font-semibold mb-1">Continue Purchased Course</h2>
        {loadingRecentCourse ? (
          <CourseCardSkeleton />
        ) : recentCourse && recentCourse.course ? (
          <div className="flex flex-row items-center gap-2 p-3 bg-white rounded-lg shadow border w-full max-w-md mb-3 min-h-[90px]">
            <img
              src={recentCourse.course.thumbnailUrl || '/ppnim_logo.svg'}
              alt={recentCourse.course.title}
              className="w-12 h-12 object-cover rounded border flex-shrink-0"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="font-semibold text-sm truncate mb-0.5">{recentCourse.course.title}</div>
              {recentCourse.course.lessons && recentCourse.course.lessons.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-0.5">Lessons:</div>
                  <ul className="flex flex-col gap-0.5">
                    {recentCourse.course.lessons.slice(0, 2).map((lesson: any, idx: number) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-1 h-1 bg-muted-foreground rounded-full inline-block" />
                        <span className="font-medium line-clamp-1">{lesson.title}</span>
                      </li>
                    ))}
                    {recentCourse.course.lessons.length > 2 && (
                      <li className="text-xs text-gray-400">+{recentCourse.course.lessons.length - 2} more lessons</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <Link href={`/Course/${recentCourse.course._id}/lesson/0`}>
              <Button size="sm" className="bg-yellow-500 text-white hover:bg-yellow-600 px-2 py-1 text-xs whitespace-nowrap rounded-full shadow-none">Continue</Button>
            </Link>
          </div>
        ) : (
          <div className="text-gray-500">No purchased courses yet.</div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-2">
        <Button
          variant={activeTab === 'courses' ? 'default' : 'outline'}
          onClick={() => setActiveTab('courses')}
          className={`rounded-full px-4 py-1 text-sm ${activeTab === 'courses' ? 'font-semibold' : ''}`}
        >
          Courses
        </Button>
        <Button
          variant={activeTab === 'tests' ? 'default' : 'outline'}
          onClick={() => setActiveTab('tests')}
          className={`rounded-full px-4 py-1 text-sm ${activeTab === 'tests' ? 'font-semibold' : ''}`}
        >
          Tests
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'courses' ? (
        <section>
          <div className='flex gap-2 p-2 px-3 text-[15px] rounded-xl bg-gray-200 shadow mb-2'>
            <Search />
            <input
              type="text"
              placeholder='Search for courses'
              className='outline-0 bg-gray-200 flex-1 text-sm '
              value={courseSearch}
              onChange={e => setCourseSearch(e.target.value)}
            />
          </div>
          {loadingCourses ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {[...Array(4)].map((_, i) => <CourseCardSkeleton key={i} />)}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-gray-500">No courses found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
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
          <div className='flex gap-2 p-2 px-3 text-[15px] rounded-xl bg-gray-200 shadow mb-2'>
            <Search />
            <input
              type="text"
              placeholder='Search for tests'
              className='outline-0 bg-gray-200 flex-1 text-sm'
              value={testSearch}
              onChange={e => setTestSearch(e.target.value)}
            />
          </div>
          <div className='w-full flex flex-wrap gap-3'>
            {loadingTests ? (
              <div className='w-full flex flex-wrap gap-3'>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-full max-w-xl"><div className="h-32 bg-gray-200 rounded-xl animate-pulse" /></div>
                ))}
              </div>
            ) : sortedTests.length === 0 ? (
              <div className="text-gray-500">No tests found.</div>
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
  );
}
