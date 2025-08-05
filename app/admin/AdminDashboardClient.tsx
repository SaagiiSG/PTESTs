'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IUser } from '@/app/models/user';
import { Users, BookOpen, GraduationCap, DollarSign, TrendingUp, Activity, Eye, ShoppingCart, Plus, ArrowRight, Calendar, Clock, UserCheck, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language';
import { getLocalizedTitle } from '@/lib/utils';

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
  admin: IUser;
}

export default function AdminDashboardClient({ stats, admin }: AdminDashboardClientProps) {
  const { t, language } = useLanguage();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOfBirth = (dateString: string) => {
    if (!dateString) return t('notSet');
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getProfileCompletionBadge = (user: any) => {
    const hasRequiredFields = user.name && user.dateOfBirth && user.gender && user.education && user.family && user.position;
    if (hasRequiredFields) {
      return <Badge variant="default" className="bg-green-100 text-green-800 text-xs">{t('complete')}</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">{t('incomplete')}</Badge>;
    }
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
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
          <p className="text-gray-600 mt-1">{t('welcomeBack')}, {admin.name || admin.email}</p>
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
                <p className="text-xs text-green-600 mt-1">{stats.totalUsers > 0 ? Math.round((stats.completeProfiles / stats.totalUsers) * 100) : 0}% {t('completionRate')}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users with Profile Info */}
        <Card className='py-6'>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('recentUsers')}
              </span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/users">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardTitle>
            <CardDescription>{t('latestRegistrations')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((user: any, index: number) => (
                  <div key={user._id} className="p-4 bg-gray-50 rounded-lg border">
                    {/* User Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name || t('unnamedUser')}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getProfileCompletionBadge(user)}
                        <div className="text-xs text-gray-400">
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Profile Information */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{t('age')}:</span>
                        <span className="font-medium">
                          {calculateAge(user.dateOfBirth) || t('unknown')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{t('gender')}:</span>
                        <span className="font-medium">{user.gender || t('notSet')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{t('education')}:</span>
                        <span className="font-medium">{user.education || t('notSet')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{t('position')}:</span>
                        <span className="font-medium">{user.position || t('notSet')}</span>
                      </div>
                    </div>

                    {/* Contact & Status */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-xs">
                        {user.phoneNumber && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">{user.phoneNumber}</span>
                          </div>
                        )}
                        {user.isEmailVerified && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-green-500" />
                            <span className="text-green-600">{t('verified')}</span>
                          </div>
                        )}
                      </div>
                      {user.isAdmin && (
                        <Badge variant="destructive" className="text-xs">{t('admin')}</Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">{t('noUsersYet')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className='py-6'>
          <CardHeader>
            <CardTitle>{t('quickActions')}</CardTitle>
            <CardDescription>{t('commonAdminTasks')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/admin/courses">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('createCourse')}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/tests">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('createTest')}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/users">
                  <Users className="w-4 h-4 mr-2" />
                  {t('userManagement')}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/analytics">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {t('analytics')}
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
                {t('recentCourses')}
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
                      <p className="text-xs text-gray-500">{course.lessons?.length || 0} {t('lessons')}</p>
                    </div>
                    <div className="text-sm font-semibold text-green-600">${course.price || 0}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">{t('noCoursesFound')}</p>
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
                {t('recentTests')}
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
                      <p className="text-sm font-medium">{getLocalizedTitle(test.title, language)}</p>
                      <p className="text-xs text-gray-500">{test.questions?.length || 0} {t('questions')}</p>
                    </div>
                    <div className="text-sm font-semibold text-green-600">${test.price || 0}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">{t('noTestsFound')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 