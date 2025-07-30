import React from 'react';
import { headers } from 'next/headers';
import CreateCourseForm from './CreateCourseForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { IUser } from '@/app/models/user';
import { redirect } from 'next/navigation';
import { Plus, GraduationCap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

async function getApiUrl(path: string) {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}${path}`;
}

async function fetchCourses() {
  try {
    const apiUrl = await getApiUrl('/api/courses');
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

export default async function CreateCoursePage() {
  const session = await auth();
  const admin: IUser | undefined = session?.user as IUser | undefined;
  if (!admin?.isAdmin) {
    redirect('/home');
  }
  
  const courses = await fetchCourses();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/courses">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
            <p className="text-gray-600 mt-1">Add a new course to your platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <GraduationCap className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Course Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Course Information</CardTitle>
                  <CardDescription>Fill in the details for your new course</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CreateCourseForm />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Recent Courses */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-blue-600">{courses.length}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                  <p className="text-2xl font-bold text-green-600">
                    {courses.reduce((sum: number, course: any) => sum + (course.lessons?.length || 0), 0)}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Courses</CardTitle>
              <CardDescription>Your latest course creations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {courses.slice(0, 3).map((course: any) => (
                  <div key={course._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{course.title}</p>
                      <p className="text-xs text-gray-500">{course.lessons?.length || 0} lessons</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">${course.price || 0}</p>
                    </div>
                  </div>
                ))}
                {courses.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No courses yet</p>
                  </div>
                )}
              </div>
              {courses.length > 3 && (
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/admin/courses">View All Courses</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Add a compelling title that clearly describes your course</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Include detailed descriptions to help students understand the content</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Upload high-quality thumbnails to make your course stand out</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Organize lessons in a logical sequence for better learning flow</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 