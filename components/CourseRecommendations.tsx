import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  ArrowRight,
  TrendingUp,
  Target,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface CourseRecommendation {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  price: number;
  lessons: any[];
  takenCount: number;
  tags: string[];
  difficulty: string;
}

interface UserStats {
  totalCoursesCompleted: number;
  totalLessonsCompleted: number;
  achievements: number;
}

export default function CourseRecommendations() {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchRecommendations();
    }
  }, [session]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses/recommendations');
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
        setUserStats(data.userStats);
      } else {
        setError('Failed to fetch recommendations');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (lessons: any[]) => {
    if (!lessons || lessons.length === 0) return '0h';
    const estimatedHours = Math.ceil(lessons.length * 0.5);
    return `${estimatedHours}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Finding perfect courses for you...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchRecommendations} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Stats Summary */}
      {userStats && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-blue-800">
              <TrendingUp className="w-5 h-5" />
              Your Learning Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{userStats.totalCoursesCompleted}</div>
                <div className="text-sm text-gray-600">Courses Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{userStats.totalLessonsCompleted}</div>
                <div className="text-sm text-gray-600">Lessons Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{userStats.achievements}</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Continue Your Learning Journey</h2>
        <p className="text-gray-600">Discover courses tailored to your interests and skill level</p>
      </div>

      {/* Course Recommendations Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((course) => (
          <Card key={course._id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative">
              {course.thumbnailUrl ? (
                <img 
                  src={course.thumbnailUrl} 
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-blue-400" />
                </div>
              )}
              
              {/* Difficulty Badge */}
              <div className="absolute top-3 right-3">
                <Badge 
                  variant="secondary"
                  className={`${
                    course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                    course.difficulty === 'Easy' ? 'bg-blue-100 text-blue-800' :
                    course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {course.difficulty}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                {course.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {course.description}
              </p>

              {/* Course Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.lessons?.length || 0} lessons</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(course.lessons)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.takenCount || 0}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {course.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-blue-600">
                  ${course.price}
                </div>
                <Link href={`/Course/${course._id}`}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <span>View Course</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center py-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready for Your Next Challenge?</h3>
          <p className="text-gray-600 mb-6">
            Explore our full course catalog and find the perfect next step in your learning journey
          </p>
          <Link href="/courses">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Browse All Courses
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
