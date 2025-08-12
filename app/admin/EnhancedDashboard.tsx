'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IUser } from '@/app/models/user';
import { 
  Users, BookOpen, GraduationCap, DollarSign, TrendingUp, Activity, 
  Eye, ShoppingCart, Plus, ArrowRight, Calendar, Clock, UserCheck, 
  Mail, Phone, BarChart3, CreditCard, Settings, Download, RefreshCw,
  Target, Award, Star, Zap, TrendingDown, AlertCircle, Info
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language';
import { getLocalizedTitle } from '@/lib/utils';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface EnhancedDashboardProps {
  admin: IUser;
}

interface DashboardStats {
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
}

interface TrendData {
  date: string;
  users: number;
  enrollments: number;
  completions: number;
  revenue: number;
  cumulativeUsers: number;
  cumulativeEnrollments: number;
  cumulativeCompletions: number;
  cumulativeRevenue: number;
}

interface PerformanceMetrics {
  userGrowthRate: number;
  revenueGrowthRate: number;
  completionRate: number;
  engagementScore: number;
}

export default function EnhancedDashboard({ admin }: EnhancedDashboardProps) {
  const { t, language } = useLanguage();
  const [timeRange, setTimeRange] = useState('30');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch basic stats
      const statsResponse = await fetch('/api/admin/dashboard-stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch trend data
      const trendsResponse = await fetch(`/api/admin/analytics/trends?days=${timeRange}`);
      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json();
        setTrendData(trendsData.trends);
        
        // Calculate performance metrics
        if (trendsData.trends.length > 0) {
          const firstDay = trendsData.trends[0];
          const lastDay = trendsData.trends[trendsData.trends.length - 1];
          
          const userGrowthRate = firstDay.cumulativeUsers > 0 
            ? ((lastDay.cumulativeUsers - firstDay.cumulativeUsers) / firstDay.cumulativeUsers) * 100 
            : 0;
          
          const revenueGrowthRate = firstDay.cumulativeRevenue > 0 
            ? ((lastDay.cumulativeRevenue - firstDay.cumulativeRevenue) / firstDay.cumulativeRevenue) * 100 
            : 0;
          
          const completionRate = lastDay.cumulativeEnrollments > 0 
            ? (lastDay.cumulativeCompletions / lastDay.cumulativeEnrollments) * 100 
            : 0;
          
          const engagementScore = Math.min(100, 
            (lastDay.cumulativeCompletions / Math.max(lastDay.cumulativeUsers, 1)) * 100
          );
          
          setPerformanceMetrics({
            userGrowthRate,
            revenueGrowthRate,
            completionRate,
            engagementScore
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportDashboardData = async () => {
    setIsExporting(true);
    try {
      const data = {
        stats,
        trendData,
        performanceMetrics,
        exportDate: new Date().toISOString(),
        timeRange
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard_data_${timeRange}_days_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getGrowthIndicator = (rate: number) => {
    if (rate > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (rate < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
          <p className="text-gray-600 mt-1">{t('welcomeBack')}, {admin.name || admin.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchDashboardData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportDashboardData} disabled={isExporting}>
            <Download className={`w-4 h-4 mr-2 ${isExporting ? 'animate-spin' : ''}`} />
            Export
          </Button>
        </div>
      </div>

      {/* Performance Metrics Overview */}
      {performanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">User Growth Rate</p>
                  <p className={`text-2xl font-bold ${performanceMetrics.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {performanceMetrics.userGrowthRate >= 0 ? '+' : ''}{performanceMetrics.userGrowthRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">vs previous period</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getGrowthIndicator(performanceMetrics.userGrowthRate)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue Growth</p>
                  <p className={`text-2xl font-bold ${performanceMetrics.revenueGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {performanceMetrics.revenueGrowthRate >= 0 ? '+' : ''}{performanceMetrics.revenueGrowthRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">vs previous period</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  {getGrowthIndicator(performanceMetrics.revenueGrowthRate)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {performanceMetrics.completionRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">course completion</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engagement Score</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(performanceMetrics.engagementScore)}`}>
                    {performanceMetrics.engagementScore.toFixed(0)}/100
                  </p>
                  <p className="text-xs text-gray-500 mt-1">user engagement</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('totalUsers')}</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">+12% {t('fromLastMonth')}</p>
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
                <p className="text-sm font-medium text-gray-600">{t('completeProfiles')}</p>
                <p className="text-2xl font-bold">{stats.completeProfiles}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.totalUsers > 0 ? Math.round((stats.completeProfiles / stats.totalUsers) * 100) : 0}% {t('completionRate')}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('totalCourses')}</p>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
                <p className="text-xs text-green-600 mt-1">+5% {t('fromLastMonth')}</p>
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
                <p className="text-sm font-medium text-gray-600">{t('totalRevenue')}</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-green-600 mt-1">+15% {t('fromLastMonth')}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth & Engagement Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              User Growth & Engagement
            </CardTitle>
            <CardDescription>New users, enrollments, and completions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="cumulativeUsers" fill="#3B82F6" fillOpacity={0.3} stroke="#3B82F6" />
                <Line yAxisId="right" type="monotone" dataKey="enrollments" stroke="#10B981" strokeWidth={2} />
                <Bar yAxisId="right" dataKey="completions" fill="#F59E0B" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue & Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Revenue & Performance
            </CardTitle>
            <CardDescription>Daily revenue and course performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="cumulativeRevenue" fill="#10B981" fillOpacity={0.3} stroke="#10B981" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#EF4444" strokeWidth={3} />
                <Bar yAxisId="right" dataKey="enrollments" fill="#8B5CF6" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/admin/courses" className="inline-flex items-center gap-2">
                  <Plus className="w-4 h-4 inline-block" />
                  <span className="font-semibold">{t('createCourse')}</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/tests" className="inline-flex items-center gap-2">
                  <Plus className="w-4 h-4 inline-block" />
                  <span className="font-semibold">{t('createTest')}</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/users" className="inline-flex items-center gap-2">
                  <Users className="w-4 h-4 inline-block" />
                  <span className="font-semibold">{t('userManagement')}</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              System Alerts
            </CardTitle>
            <CardDescription>Important notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.incompleteProfiles > 0 && (
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    {stats.incompleteProfiles} incomplete profiles
                  </span>
                </div>
              )}
              {stats.totalRevenue === 0 && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    No revenue generated yet
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Performance Summary
            </CardTitle>
            <CardDescription>Key metrics overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">User Growth</span>
                <Badge variant={performanceMetrics?.userGrowthRate >= 0 ? "default" : "destructive"}>
                  {performanceMetrics?.userGrowthRate.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue Growth</span>
                <Badge variant={performanceMetrics?.revenueGrowthRate >= 0 ? "default" : "destructive"}>
                  {performanceMetrics?.revenueGrowthRate.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Engagement</span>
                <Badge variant="outline">
                  {performanceMetrics?.engagementScore.toFixed(0)}/100
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
