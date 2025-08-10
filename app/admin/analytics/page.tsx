"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Clock, 
  Award,
  BarChart3,
  Calendar,
  Target,
  Star
} from 'lucide-react';
import AdminPageWrapper from '@/components/AdminPageWrapper';

interface CourseStats {
  _id: string;
  title: string;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  averageTimeToComplete: number;
  totalLessons: number;
}

interface UserProgressStats {
  totalUsers: number;
  activeUsers: number;
  totalCoursesCompleted: number;
  totalLessonsCompleted: number;
  averageCompletionRate: number;
  topAchievers: Array<{
    name: string;
    coursesCompleted: number;
    achievements: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [userStats, setUserStats] = useState<UserProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [coursesResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/analytics/courses'),
        fetch('/api/admin/analytics/users')
      ]);

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourseStats(coursesData.courses);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUserStats(usersData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <AdminPageWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track course performance and user engagement</p>
        </div>

        {/* Overview Stats */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {userStats.activeUsers} active this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalCoursesCompleted}</div>
                <p className="text-xs text-muted-foreground">
                  {userStats.averageCompletionRate.toFixed(1)}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalLessonsCompleted}</div>
                <p className="text-xs text-muted-foreground">
                  Across all courses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Achievers</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.topAchievers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Users with highest achievements
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Course Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Course Performance</span>
            </CardTitle>
            <CardDescription>
              Detailed breakdown of course completion rates and engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {courseStats.map((course) => (
                <div key={course._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <Badge variant={course.completionRate >= 70 ? "default" : "secondary"}>
                      {course.completionRate.toFixed(1)}% Complete
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="text-sm">
                      <span className="text-gray-600">Enrollments:</span>
                      <span className="font-medium ml-2">{course.totalEnrollments}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-medium ml-2">{course.completedEnrollments}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Avg. Time:</span>
                      <span className="font-medium ml-2">{formatTime(course.averageTimeToComplete)}</span>
                    </div>
                  </div>
                  
                  <Progress value={course.completionRate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Achievers */}
        {userStats?.topAchievers && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Top Achievers</span>
              </CardTitle>
              <CardDescription>
                Users with the highest course completion rates and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userStats.topAchievers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">
                          {user.coursesCompleted} courses completed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">{user.achievements} achievements</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest course completions and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Recent activity will appear here</p>
              <p className="text-sm">Track user engagement in real-time</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  );
} 