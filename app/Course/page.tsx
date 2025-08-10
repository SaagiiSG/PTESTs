"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import CourseCard from '@/components/home/CourseCard';
import CourseCardSkeleton from '@/components/home/CourseCardSkeleton';
import Link from 'next/link';
import { useLanguage } from '@/lib/language';
import { BookOpen, GraduationCap, Star, Brain, Stethoscope, User } from 'lucide-react';

async function fetchCoursesClient() {
  const res = await fetch('/api/courses');
  if (!res.ok) {
    const text = await res.text();
    console.error("API error (courses):", res.status, text);
    return [];
  }
  return res.json();
}

export default function CoursePage() {
  const [courseSearch, setCourseSearch] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    setLoadingCourses(true);
    fetchCoursesClient().then((data) => { 
      console.log('📚 Courses loaded:', data.length, 'courses');
      console.log('🖼️ Course thumbnails:', data.map((c: any) => ({ title: c.title, thumbnailUrl: c.thumbnailUrl })));
      setCourses(data); 
      setLoadingCourses(false); 
    });
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    course.description.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen  ">
      <div className="w-full md:w-[80vw] mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Explore Our Courses
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover comprehensive learning paths designed to enhance your skills and advance your career
          </p>
        </div>

        {/* Search Bar */}
        <div className='flex gap-2 p-2 px-3 text-[15px] rounded-xl bg-white dark:bg-gray-800 shadow-lg mb-8 max-w-md mx-auto border border-gray-200 dark:border-gray-700'>
          <Search className="text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search for courses..."
            className='outline-0 bg-transparent flex-1 text-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
            value={courseSearch}
            onChange={e => setCourseSearch(e.target.value)}
          />
        </div>

        {/* Course Stats */}
        

        {/* Courses Grid */}
        {loadingCourses ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="stagger-item">
                <CourseCardSkeleton />
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto mb-6 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No courses found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {courseSearch ? `No courses match "${courseSearch}"` : 'No courses available at the moment'}
            </p>
            {courseSearch && (
              <Button 
                onClick={() => setCourseSearch('')}
                variant="outline"
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-3xl text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of learners who have already transformed their careers with our comprehensive courses
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/home">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold transition-all duration-300 hover:scale-105">
                  Browse All Courses
                </Button>
              </Link>
              <Link href="/test-payment">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold transition-all duration-300 hover:scale-105">
                  Test Payment System
                </Button>
              </Link>
              <Link href="/test-free-enrollment">
                <Button size="lg" variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white font-semibold transition-all duration-300 hover:scale-105">
                  Test Free Enrollment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 