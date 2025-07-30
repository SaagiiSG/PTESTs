"use client";
import React, { useEffect, useState, useMemo } from 'react';
import CourseCard from '@/components/home/CourseCard';
import Navbar from '@/components/navbar';
import { Search } from 'lucide-react';
import CourseCardSkeleton from '@/components/home/CourseCardSkeleton';
import BreadCrumbs from '@/components/ui/Breadcrumbs';
import LangToggle from '@/components/LangToggle';
import { useLanguage } from '@/lib/language';

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = useMemo(() => {
    if (!search) return courses;
    const s = search.toLowerCase();
    return courses.filter(
      c =>
        c.title?.toLowerCase().includes(s) ||
        c.description?.toLowerCase().includes(s)
    );
  }, [search, courses]);

  return (
    <div className="w-full h-auto flex flex-col gap-4 pb-5">
      <header className="h-auto flex flex-col gap-4">
        <div className="flex justify-between items-center mb-6 mt-6">
          <h1 className="text-2xl font-bold">{t('courses')}</h1>
        </div>
        <BreadCrumbs />
        <div className='flex gap-2 p-3 px-5 text-[16px] rounded-xl bg-gray-200 shadow-md mb-4'>
          <Search />
          <input
            type="text"
            placeholder={`${t('search')} for courses`}
            className='outline-0 bg-gray-200 flex-1'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-gray-500">{t('noCoursesFound')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                _id={course._id}
                title={course.title}
                description={course.description}
                lessonCount={course.lessons?.length || 0}
                price={course.price}
                thumbnailUrl={course.thumbnailUrl}
              />
            ))}
          </div>
        )}
      </header>
    </div>
  );
}
