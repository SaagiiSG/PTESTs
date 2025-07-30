import React from 'react';
import { headers } from 'next/headers';
import CreateTestForm from './CreateTestForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { IUser } from '@/app/models/user';
import { redirect } from 'next/navigation';
import { Plus, BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

async function getApiUrl(path: string) {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}${path}`;
}

async function fetchTests() {
  try {
    const res = await fetch(await getApiUrl('/api/tests'), { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching tests:', error);
    return [];
  }
}

export default async function CreateTestPage() {
  const session = await auth();
  const admin: IUser | undefined = session?.user as IUser | undefined;
  if (!admin?.isAdmin) {
    redirect('/home');
  }
  
  const tests = await fetchTests();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/tests">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tests
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Test</h1>
            <p className="text-gray-600 mt-1">Add a new test to your platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Test Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Test Information</CardTitle>
                  <CardDescription>Fill in the details for your new test</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CreateTestForm />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Recent Tests */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold text-green-600">{tests.length}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Questions</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {tests.reduce((sum: number, test: any) => sum + (test.questions?.length || 0), 0)}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {tests.reduce((sum: number, test: any) => sum + (test.takenCount || 0), 0)}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Tests</CardTitle>
              <CardDescription>Your latest test creations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tests.slice(0, 3).map((test: any) => (
                  <div key={test._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{test.title}</p>
                      <p className="text-xs text-gray-500">{test.questions?.length || 0} questions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">${test.price || 0}</p>
                    </div>
                  </div>
                ))}
                {tests.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No tests yet</p>
                  </div>
                )}
              </div>
              {tests.length > 3 && (
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/admin/tests">View All Tests</Link>
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
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Create clear, descriptive titles for your tests</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Provide detailed descriptions in both languages</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Use high-quality embed codes for smooth integration</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Set appropriate pricing based on test complexity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 