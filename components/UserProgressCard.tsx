import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  BookOpen, 
  Clock, 
  Award, 
  Star, 
  Target,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface UserProgressCardProps {
  userProgress: {
    totalCoursesCompleted: number;
    totalLessonsCompleted: number;
    achievements: string[];
    courses: Array<{
      courseId: string;
      courseTitle?: string;
      isCompleted: boolean;
      completionPercentage: number;
      totalTimeSpent: number;
      lessons: Array<{
        lessonIndex: number;
        completed: boolean;
        timeSpent: number;
        testScore?: number;
      }>;
    }>;
  };
}

export default function UserProgressCard({ userProgress }: UserProgressCardProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getAchievementIcon = (achievement: string) => {
    if (achievement.includes('course_completion')) return <Trophy className="w-4 h-4" />;
    if (achievement.includes('course_')) return <BookOpen className="w-4 h-4" />;
    if (achievement.includes('lesson_')) return <Target className="w-4 h-4" />;
    return <Star className="w-4 h-4" />;
  };

  const getAchievementColor = (achievement: string) => {
    if (achievement.includes('course_completion')) return 'bg-yellow-100 text-yellow-800';
    if (achievement.includes('course_')) return 'bg-blue-100 text-blue-800';
    if (achievement.includes('lesson_')) return 'bg-green-100 text-green-800';
    return 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Courses Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userProgress.totalCoursesCompleted}</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>Great progress!</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lessons Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userProgress.totalLessonsCompleted}</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Target className="w-3 h-3 mr-1" />
              <span>Keep learning!</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{userProgress.achievements.length}</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Award className="w-3 h-3 mr-1" />
              <span>Unlocked!</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress */}
      {userProgress.courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Course Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userProgress.courses.map((course, index) => (
                <div key={course.courseId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">
                      {course.courseTitle || `Course ${index + 1}`}
                    </h3>
                    <Badge variant={course.isCompleted ? "default" : "secondary"}>
                      {course.isCompleted ? "Completed" : `${course.completionPercentage}%`}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span>
                        {course.lessons.filter(l => l.completed).length} of {course.lessons.length} lessons
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{formatTime(course.totalTimeSpent)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>
                        {course.isCompleted ? "Finished" : "In Progress"}
                      </span>
                    </div>
                  </div>
                  
                  <Progress value={course.completionPercentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {userProgress.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userProgress.achievements.map((achievement, index) => (
                <Badge 
                  key={index} 
                  className={`flex items-center space-x-1 ${getAchievementColor(achievement)}`}
                >
                  {getAchievementIcon(achievement)}
                  <span>
                    {achievement.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Streak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Learning Streak</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {userProgress.totalCoursesCompleted > 0 ? "Active" : "Start Learning"}
            </div>
            <p className="text-gray-600">
              {userProgress.totalCoursesCompleted > 0 
                ? "You're on a great learning journey!" 
                : "Complete your first lesson to start building your streak"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
