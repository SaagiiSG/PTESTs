import React from 'react';
import { headers } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { IUser } from '@/app/models/user';
import { redirect } from 'next/navigation';
import { Users, BookOpen, GraduationCap, DollarSign, TrendingUp, Activity, Eye, ShoppingCart, Plus, ArrowRight, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

async function getApiUrl(path: string) {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}${path}`;
}

async function fetchStats() {
  try {
    const [usersRes, coursesRes, testsRes, purchasesRes] = await Promise.all([
      fetch(await getApiUrl('/api/user'), { cache: 'no-store' }),
      fetch(await getApiUrl('/api/courses'), { cache: 'no-store' }),
      fetch(await getApiUrl('/api/tests'), { cache: 'no-store' }),
      fetch(await getApiUrl('/api/profile/purchase-history'), { cache: 'no-store' })
    ]);

    const users = usersRes.ok ? await usersRes.json() : [];
    const courses = coursesRes.ok ? await coursesRes.json() : [];
    const tests = testsRes.ok ? await testsRes.json() : [];
    const purchases = purchasesRes.ok ? await purchasesRes.json() : [];

    return {
      totalUsers: users.length,
      totalCourses: courses.length,
      totalTests: tests.length,
      totalRevenue: purchases.reduce((sum: number, purchase: any) => sum + (purchase.amount || 0), 0),
      recentPurchases: purchases.slice(0, 5),
      recentUsers: users.slice(-5).reverse(),
      recentCourses: courses.slice(-3).reverse(),
      recentTests: tests.slice(-3).reverse()
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalUsers: 0,
      totalCourses: 0,
      totalTests: 0,
      totalRevenue: 0,
      recentPurchases: [],
      recentUsers: [],
      recentCourses: [],
      recentTests: []
    };
  }
}

export default async function AdminDashboard() {
  const session = await auth();
  const admin: IUser | undefined = session?.user as IUser | undefined;
  if (!admin?.isAdmin) {
    redirect('/home');
  }

  const stats = await fetchStats();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ShoppingCart className="w-4 h-4 text-green-600" />;
      case 'user':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'course':
        return <GraduationCap className="w-4 h-4 text-purple-600" />;
      case 'test':
        return <BookOpen className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {admin.name || admin.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
                <p className="text-xs text-green-600 mt-1">+5% from last month</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold">{stats.totalTests}</p>
                <p className="text-xs text-green-600 mt-1">+8% from last month</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-green-600 mt-1">+15% from last month</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className='py-6'>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest platform activities and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentPurchases.length > 0 ? (
                stats.recentPurchases.map((purchase: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ShoppingCart className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New Purchase</p>
                      <p className="text-xs text-gray-500">
                        ${purchase.amount || 0} • {purchase.courseTitle || purchase.testTitle || 'Unknown Item'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(purchase.createdAt || new Date().toISOString())}
                    </div>
                  </div>
                ))
              ) : stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((user: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New User Registration</p>
                      <p className="text-xs text-gray-500">{user.name || user.email}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(user.createdAt || new Date().toISOString())}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className='py-6'>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/admin/courses">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Course
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/tests">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Test
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/users">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/analytics">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <Card className='py-6'>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Recent Courses
              </span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/courses">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentCourses.length > 0 ? (
                stats.recentCourses.map((course: any) => (
                  <div key={course._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{course.title}</p>
                      <p className="text-xs text-gray-500">{course.lessons?.length || 0} lessons</p>
                    </div>
                    <div className="text-sm font-semibold text-green-600">${course.price || 0}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No courses yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tests */}
        <Card className='py-6'>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Recent Tests
              </span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/tests">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentTests.length > 0 ? (
                stats.recentTests.map((test: any) => (
                  <div key={test._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{test.title}</p>
                      <p className="text-xs text-gray-500">{test.questions?.length || 0} questions</p>
                    </div>
                    <div className="text-sm font-semibold text-green-600">${test.price || 0}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No tests yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}