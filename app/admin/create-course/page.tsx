import React from 'react';
import CourseCard from '@/components/home/CourseCard';
import { headers } from 'next/headers';
import CreateCourseForm from './CreateCourseForm';
import { Card } from '@/components/ui/card';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { auth } from '@/lib/auth';
import { IUser } from '@/app/models/user';
import { redirect } from 'next/navigation';

function getApiUrl(path: string) {
  return headers().then(headersList => {
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    return `${protocol}://${host}${path}`;
  });
}

async function fetchCourses() {
  const apiUrl = await getApiUrl('/api/courses');
  const res = await fetch(apiUrl, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function CreateCoursePage() {
  const session = await auth();
  const admin: IUser | undefined = session?.user as IUser | undefined;
  if (!admin?.isAdmin) {
    redirect('/home');
  }
  const courses = await fetchCourses();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="col-span-2">
        <Breadcrumbs />
      </div>
      {/* Create Course Form */}
      <Card className="rounded-2xl bg-muted shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Create Course</h2>
        <CreateCourseForm />
      </Card>
      {/* All Courses */}
      <Card className="rounded-2xl bg-muted shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-2">All Courses</h3>
        <div className="flex flex-col gap-4">
          {courses.length === 0 ? <div className="text-gray-500">No courses found.</div> :
            courses.map((course: any) => (
              <CourseCard key={course._id} _id={course._id} title={course.title} description={course.description} lessonCount={course.lessons?.length || 0} price={course.price} thumbnailUrl={course.thumbnailUrl} />
            ))}
        </div>
      </Card>
    </div>
  );
} 