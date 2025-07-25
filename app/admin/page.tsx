import React from 'react';
import TestCards from '@/components/home/TestCards';
import CourseCard from '@/components/home/CourseCard';
import { headers } from 'next/headers';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { IUser } from '@/app/models/user';
import { redirect } from 'next/navigation';

function getApiUrl(path: string) {
  const headersList = headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}${path}`;
}

async function fetchTests() {
  const res = await fetch(getApiUrl('/api/tests'), { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

async function fetchCourses() {
  const res = await fetch(getApiUrl('/api/courses'), { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const admin: IUser | undefined = session?.user as IUser | undefined;
  if (!admin?.isAdmin) {
    redirect('/home');
  }
  const [tests, courses] = await Promise.all([fetchTests(), fetchCourses()]);
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Welcome to the Admin Dashboard</h2>
      <p className="w-3/5 text-lg text-gray-700 mb-8">Manage tests, courses, and users from the sidebar. Use the links to create new tests or courses, or view analytics and reports (coming soon).</p>
      {/* TESTS SECTION */}
      <div className="w-full flex flex-wrap gap-8 mb-10">
      
            {tests.length === 0 ? <div className="text-gray-500">No tests found.</div> :
              tests.map((test: any) => (
                <TestCards key={test._id} hr={test.title} shortDes={test.description?.mn || test.description?.en || ''} slug={test.slug || test._id} variant="small" thumbnailUrl={test.thumbnailUrl} price={test.price} />
              ))}
      </div>
      {/* COURSES SECTION */}
      <div className="w-full gap-8 mb-10">
        {/* Create Course */}
        
        {/* All Courses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-2">All Courses</h3>
          <div className="flex flex-col gap-4">
            {courses.length === 0 ? <div className="text-gray-500">No courses found.</div> :
              courses.map((course: any) => (
                <CourseCard key={course._id} _id={course._id} title={course.title} description={course.description} lessonCount={course.lessons?.length || 0} price={course.price} thumbnailUrl={course.thumbnailUrl} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}