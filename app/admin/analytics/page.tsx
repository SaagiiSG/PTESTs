import React from 'react';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { IUser } from '@/app/models/user';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, DollarSign, BookOpen, GraduationCap, Calendar, Download } from 'lucide-react';

async function getApiUrl(path: string) {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}${path}`;
}

async function fetchAnalytics() {
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

    // Calculate analytics
    const totalRevenue = purchases.reduce((sum: number, purchase: any) => sum + (purchase.amount || 0), 0);
    const monthlyRevenue = purchases.filter((purchase: any) => {
      const purchaseDate = new Date(purchase.createdAt);
      const now = new Date();
      return purchaseDate.getMonth() === now.getMonth() && purchaseDate.getFullYear() === now.getFullYear();
    }).reduce((sum: number, purchase: any) => sum + (purchase.amount || 0), 0);

    const newUsersThisMonth = users.filter((user: any) => {
      const userDate = new Date(user.createdAt);
      const now = new Date();
      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      totalUsers: users.length,
      totalCourses: courses.length,
      totalTests: tests.length,
      totalRevenue,
      monthlyRevenue,
      newUsersThisMonth,
      totalPurchases: purchases.length,
      averageOrderValue: totalRevenue / (purchases.length || 1),
      topCourses: courses.slice(0, 5),
      topTests: tests.slice(0, 5)
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      totalUsers: 0,
      totalCourses: 0,
      totalTests: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      newUsersThisMonth: 0,
      totalPurchases: 0,
      averageOrderValue: 0,
      topCourses: [],
      topTests: []
    };
  }
}

export default async function AnalyticsPage() {
  const session = await auth();
  const admin: IUser | undefined = session?.user as IUser | undefined;
  if (!admin?.isAdmin) {
    redirect('/home');
  }

  const analytics = await fetchAnalytics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your platform performance</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">${analytics.monthlyRevenue.toFixed(2)}</p>
                <p className="text-xs text-blue-600 mt-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  This month
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Users</p>
                <p className="text-2xl font-bold">{analytics.newUsersThisMonth}</p>
                <p className="text-xs text-purple-600 mt-1">
                  <Users className="w-3 h-3 inline mr-1" />
                  This month
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold">${analytics.averageOrderValue.toFixed(2)}</p>
                <p className="text-xs text-orange-600 mt-1">
                  <BarChart3 className="w-3 h-3 inline mr-1" />
                  Per purchase
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <Card className='py-6'>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Revenue Overview
            </CardTitle>
            <CardDescription>Monthly revenue trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500">Revenue chart will be displayed here</p>
                <p className="text-sm text-gray-400">Integration with chart library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Growth Chart Placeholder */}
        <Card className='py-6'>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Growth
            </CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500">User growth chart will be displayed here</p>
                <p className="text-sm text-gray-400">Integration with chart library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <Card className='py-6'>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Top Performing Courses
            </CardTitle>
            <CardDescription>Most popular courses by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCourses.length > 0 ? (
                analytics.topCourses.map((course: any, index: number) => (
                  <div key={course._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-gray-500">{course.lessons?.length || 0} lessons</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${course.price || 0}</p>
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No courses available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Tests */}
        <Card className='py-6'>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Top Performing Tests
            </CardTitle>
            <CardDescription>Most popular tests by attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topTests.length > 0 ? (
                analytics.topTests.map((test: any, index: number) => (
                  <div key={test._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{test.title}</p>
                        <p className="text-sm text-gray-500">{test.questions?.length || 0} questions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${test.price || 0}</p>
                      <p className="text-xs text-gray-500">{test.takenCount || 0} attempts</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No tests available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Statistics */}
      <Card className='py-6'>
        <CardHeader>
          <CardTitle>Platform Statistics</CardTitle>
          <CardDescription>Comprehensive overview of platform metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{analytics.totalUsers}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{analytics.totalCourses}</p>
              <p className="text-sm text-gray-600">Total Courses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{analytics.totalTests}</p>
              <p className="text-sm text-gray-600">Total Tests</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{analytics.totalPurchases}</p>
              <p className="text-sm text-gray-600">Total Purchases</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 