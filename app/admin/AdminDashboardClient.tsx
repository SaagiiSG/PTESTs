'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, BookOpen, GraduationCap, DollarSign, TrendingUp, Activity, Plus, ArrowRight, Settings, BarChart3, Eye, Edit, Trash2, Download } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language';
import { LineChart as MuiLineChart } from '@mui/x-charts/LineChart';
import { BarChart as MuiBarChart } from '@mui/x-charts/BarChart';

interface AdminDashboardClientProps {
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalTests: number;
    totalRevenue: number;
    recentPurchases: any[];
    recentUsers: any[];
    recentCourses: any[];
    recentTests: any[];
    completeProfiles: number;
    incompleteProfiles: number;
  };
  admin: any;
}

export default function AdminDashboardClient({ stats, admin }: AdminDashboardClientProps) {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState('30');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/admin/analytics/trends?days=${timeRange}`);
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Simple data processing - no complex MongoDB objects
  const safeStats = {
    totalUsers: Number(stats?.totalUsers) || 0,
    totalCourses: Number(stats?.totalCourses) || 0,
    totalTests: Number(stats?.totalTests) || 0,
    totalRevenue: Number(stats?.totalRevenue) || 0,
    completeProfiles: Number(stats?.completeProfiles) || 0,
    incompleteProfiles: Number(stats?.incompleteProfiles) || 0
  };

  const safeAdmin = {
    name: String(admin?.name || 'Admin'),
    email: String(admin?.email || '')
  };

  const safeRecentUsers = Array.isArray(stats?.recentUsers) ? stats.recentUsers.slice(0, 5) : [];
  const safeRecentPurchases = Array.isArray(stats?.recentPurchases) ? stats.recentPurchases.slice(0, 5) : [];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Prepare chart data
  const chartData = analyticsData?.trends || [];
  const xAxis = chartData.map((item: any) => item.date);
  const userData = chartData.map((item: any) => item.users);
  const revenueData = chartData.map((item: any) => item.revenue);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
          <p className="text-gray-600 mt-1">Welcome back, {safeAdmin.name}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select> */}
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* First Row - Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {safeStats.completeProfiles} complete profiles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Active courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalTests}</div>
            <p className="text-xs text-muted-foreground">
              Available tests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${safeStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Two Big Boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Box 1 - Recent Activities with Tabs */}
        <Card className="h-96 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest user and payment activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="users" className="mt-4">
                <div className="space-y-3 max-h-64 overflow-y-auto pb-12">
                  {safeRecentUsers.length > 0 ? (
                    safeRecentUsers.map((user: any, index: number) => (
                      <div key={user._id || index} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {String(user.name || 'Unnamed User')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {String(user.email || user.phoneNumber || 'No contact info')}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/users/${user._id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No recent users</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="payments" className="mt-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {safeRecentPurchases.length > 0 ? (
                    safeRecentPurchases.map((purchase: any, index: number) => (
                      <div key={purchase._id || index} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {String(purchase.courseTitle || purchase.testTitle || 'Unknown Item')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {String(purchase.userName || purchase.userEmail || 'Unknown User')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              ${(Number(purchase.amount) || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(purchase.createdAt || purchase.purchaseDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No recent purchases</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Box 2 - Quick Actions Grid */}
        <Card className="h-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap h-full justify-between gap-4">
              {/* Row 1 */}
              <Button asChild variant="outline" className="w-[48%] h-[100%] p-4 flex-col gap-2">
                <Link href="/admin/courses">
                  <Plus className="w-6 h-6 text-white " />
                  <span className="text-sm font-medium dark:text-white">Create Course </span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-[48%] h-20 p-4 flex-col gap-2 border-2">
                <Link href="/admin/tests">
                  <BookOpen className="w-6 h-6" />
                  <span className="text-sm font-medium">Create Test</span>
                </Link>
              </Button>
              
              {/* Row 2 */}
              <Button asChild variant="outline" className="w-[48%] h-20 p-4 flex-col gap-2 border-2">
                <Link href="/admin/users">
                  <Users className="w-6 h-6" />
                  <span className="text-sm font-medium">Manage Users</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-[48%] h-20 p-4 flex-col gap-2 border-2">
                <Link href="/admin/analytics">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-sm font-medium">View Analytics</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third Row - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Registration Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              User Registration Trends
            </CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-64">
                <MuiLineChart
                  xAxis={[{ data: xAxis, scaleType: 'band' }]}
                  series={[
                    {
                      data: userData,
                      label: 'New Users',
                      color: '#3b82f6'
                    }
                  ]}
                  height={250}
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Revenue Trends
            </CardTitle>
            <CardDescription>Daily revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-64">
                <MuiBarChart
                  xAxis={[{ data: xAxis, scaleType: 'band' }]}
                  series={[
                    {
                      data: revenueData,
                      label: 'Revenue ($)',
                      color: '#10b981'
                    }
                  ]}
                  height={250}
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 