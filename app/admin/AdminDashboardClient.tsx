'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, BookOpen, GraduationCap, DollarSign, TrendingUp, Activity, Plus, ArrowRight, Settings, BarChart3, Eye, Edit, Trash2, Download, TestTube } from 'lucide-react';
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
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [totalTests, setTotalTests] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any>({});
  const [monthlyUsers, setMonthlyUsers] = useState<any>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard data (total tests and revenue)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('🔄 Fetching dashboard data...');
        
        // Fetch total tests
        const testsResponse = await fetch('/api/admin/tests');
        if (testsResponse.ok) {
          const testsData = await testsResponse.json();
          console.log('📝 Tests data:', testsData);
          setTotalTests(testsData.totalTests || 0);
        }

        // Fetch revenue data
        const revenueResponse = await fetch('/api/admin/analytics/payments');
        if (revenueResponse.ok) {
          const revenueData = await revenueResponse.json();
          console.log('💰 Revenue data:', revenueData);
          setTotalRevenue(revenueData.totalRevenue || 0);
          setMonthlyRevenue(revenueData.monthlyRevenue || {});
          setMonthlyUsers(revenueData.monthlyUsers || {});
        }
      } catch (error) {
        console.error('❌ Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

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

  // Fetch recent payments
  useEffect(() => {
    const fetchRecentPayments = async () => {
      try {
        setIsLoadingPayments(true);
        console.log('🔄 Fetching recent payments...');
        const response = await fetch('/api/admin/analytics/payments');
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Recent payments API response:', data);
          if (data.recentPayments && Array.isArray(data.recentPayments)) {
            // Take the 3 most recent payments
            const recent3 = data.recentPayments.slice(0, 3);
            console.log('💰 Processed recent 3 payments:', recent3);
            setRecentPayments(recent3);
          } else {
            console.log('❌ No recent payments data found in response');
          }
        } else {
          console.error('❌ Failed to fetch recent payments:', response.status);
        }
      } catch (error) {
        console.error('❌ Error fetching recent payments:', error);
      } finally {
        setIsLoadingPayments(false);
      }
    };

    fetchRecentPayments();
  }, []);

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
            onClick={() => {
              // Refresh all dashboard data
              const refreshAllData = async () => {
                try {
                  setIsRefreshing(true);
                  console.log('🔄 Refreshing all dashboard data...');
                  
                  // Refresh dashboard data
                  const testsResponse = await fetch('/api/admin/tests');
                  if (testsResponse.ok) {
                    const testsData = await testsResponse.json();
                    setTotalTests(testsData.totalTests || 0);
                  }

                  const revenueResponse = await fetch('/api/admin/analytics/payments');
                  if (revenueResponse.ok) {
                    const revenueData = await revenueResponse.json();
                    setTotalRevenue(revenueData.totalRevenue || 0);
                    setMonthlyRevenue(revenueData.monthlyRevenue || {});
                    setMonthlyUsers(revenueData.monthlyUsers || {});
                  }

                  // Refresh recent payments
                  if (revenueResponse.ok) {
                    const revenueData = await revenueResponse.json();
                    if (revenueData.recentPayments && Array.isArray(revenueData.recentPayments)) {
                      const recent3 = revenueData.recentPayments.slice(0, 3);
                      setRecentPayments(recent3);
                    }
                  }

                  console.log('✅ All dashboard data refreshed!');
                } catch (error) {
                  console.error('❌ Error refreshing dashboard data:', error);
                } finally {
                  setIsRefreshing(false);
                }
              };

              refreshAllData();
            }} 
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                Refreshing...
              </div>
            ) : (
              'Refresh'
            )}
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

        {/* Total Tests Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isRefreshing ? (
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                totalTests
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Available tests for users
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isRefreshing ? (
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                `₮${totalRevenue.toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total platform revenue
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
              <Activity className="w-5 h-5 inline-block" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest user and payment activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="payments" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 inline-block" />
                  Recent Payments
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Refresh recent payments
                      const fetchRecentPayments = async () => {
                        try {
                          setIsLoadingPayments(true);
                          console.log('🔄 Manually refreshing recent payments...');
                          const response = await fetch('/api/admin/analytics/payments');
                          if (response.ok) {
                            const data = await response.json();
                            console.log('📊 Refreshed payments API response:', data);
                            if (data.recentPayments && Array.isArray(data.recentPayments)) {
                              const recent3 = data.recentPayments.slice(0, 3);
                              console.log('💰 Refreshed recent 3 payments:', recent3);
                              setRecentPayments(recent3);
                            }
                          }
                        } catch (error) {
                          console.error('❌ Error refreshing payments:', error);
                        } finally {
                          setIsLoadingPayments(false);
                        }
                      };
                      fetchRecentPayments();
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-gray-200"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </Button>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="users" className="mt-4">
                <div className="space-y-3 max-h-64 overflow-y-auto pb-12">
                  {safeRecentUsers.length > 0 ? (
                    safeRecentUsers.map((user: any, index: number) => (
                      <div key={user._id || index} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600 inline-block" />
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
                              <Eye className="w-4 h-4 inline-block" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-300 inline-block" />
                      <p>No recent users</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="payments" className="mt-4">
             
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {isLoadingPayments || isRefreshing ? (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300 animate-spin inline-block" />
                      <p>Loading recent payments...</p>
                    </div>
                  ) : recentPayments.length > 0 ? (
                    recentPayments.map((payment: any, index: number) => (
                      <div key={payment._id || index} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {String(payment.itemName || payment.courseTitle || payment.testTitle || 'Unknown Item')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {String(payment.customerName || payment.userName || payment.userEmail || 'Unknown User')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              ₮{(Number(payment.payment_amount) || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(payment.payment_date || payment.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300 inline-block" />
                      <p>No recent payments</p>
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
              <Settings className="w-5 h-5 inline-block" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap h-full justify-between gap-4">
              {/* Row 1 */}
              <Button asChild variant="outline" className="w-[48%] h-[100%] p-4 flex-col gap-2">
                <Link href="/admin/courses">
                  <Plus className="w-6 h-6 dark:text-white text-black inline-block" />
                  <span className="text-sm font-medium dark:text-white">Create Course </span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-[48%] h-20 p-4 flex-col gap-2 border-2">
                <Link href="/admin/tests">
                  <BookOpen className="w-6 h-6 inline-block" />
                  <span className="text-sm font-medium">Create Test</span>
                </Link>
              </Button>
              
              {/* Row 2 */}
              <Button asChild variant="outline" className="w-[48%] h-20 p-4 flex-col gap-2 border-2">
                <Link href="/admin/users">
                  <Users className="w-6 h-6 inline-block" />
                  <span className="text-sm font-medium">Manage Users</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-[48%] h-20 p-4 flex-col gap-2 border-2">
                <Link href="/admin/analytics">
                  <BarChart3 className="w-6 h-6 inline-block" />
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
              <TrendingUp className="w-5 h-5 inline-block" />
              User Registration Trends
            </CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            {isRefreshing ? (
              <div className="h-64 flex items-center justify-center">
                <div className="space-y-4">
                  <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse"></div>
                </div>
              </div>
            ) : Object.keys(monthlyUsers).length > 0 ? (
              <div className="h-64">
                <MuiLineChart
                  xAxis={[{ 
                    data: Object.keys(monthlyUsers).map(monthKey => {
                      try {
                        const [year, month] = monthKey.split('-');
                        const date = new Date(parseInt(year), parseInt(month) - 1);
                        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                      } catch (error) {
                        return monthKey;
                      }
                    }), 
                    scaleType: 'band' 
                  }]}
                  series={[
                    {
                      data: Object.values(monthlyUsers),
                      label: 'New Users',
                      color: '#3b82f6'
                    }
                  ]}
                  height={250}
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No user data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 inline-block" />
              Revenue Trends
            </CardTitle>
            <CardDescription>Monthly revenue from actual payments</CardDescription>
          </CardHeader>
          <CardContent>
            {isRefreshing ? (
              <div className="h-64 flex items-center justify-center">
                <div className="space-y-4">
                  <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse"></div>
                </div>
              </div>
            ) : Object.keys(monthlyRevenue).length > 0 ? (
              <div className="h-64">
                <MuiBarChart
                  xAxis={[{ 
                    data: Object.keys(monthlyRevenue).map(monthKey => {
                      try {
                        const [year, month] = monthKey.split('-');
                        const date = new Date(parseInt(year), parseInt(month) - 1);
                        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                      } catch (error) {
                        return monthKey;
                      }
                    }), 
                    scaleType: 'band' 
                  }]}
                  series={[
                    {
                      data: Object.values(monthlyRevenue),
                      label: 'Monthly Revenue (₮)',
                      color: '#10b981'
                    }
                  ]}
                  height={250}
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No revenue data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 