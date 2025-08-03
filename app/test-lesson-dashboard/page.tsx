"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen,
  Clock,
  CheckCircle,
  Circle,
  PlayCircle,
  TrendingUp,
  Users,
  Star,
  Video,
  Target
} from 'lucide-react';

export default function TestDashboardPage() {
  const [lessonRating, setLessonRating] = useState(0);
  const [completedLessons] = useState(new Set([0, 1, 2]));
  
  const lessons = [
    { title: "Introduction to React", duration: "20 min" },
    { title: "Components and Props", duration: "25 min" },
    { title: "State and Lifecycle", duration: "30 min" },
    { title: "Hooks and Effects", duration: "35 min" },
    { title: "Advanced Patterns", duration: "40 min" }
  ];
  
  const currentIdx = 2;
  const progress = ((currentIdx + 1) / lessons.length) * 100;

  const getLessonStatus = (idx: number) => {
    if (idx === currentIdx) return 'current';
    if (completedLessons.has(idx)) return 'completed';
    return 'upcoming';
  };

  const getLessonClassName = (status: string) => {
    switch (status) {
      case 'current':
        return "block px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105 border-2 border-blue-400";
      case 'completed':
        return "block px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200";
      default:
        return "block px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Test Dashboard</h1>
          <p className="text-gray-600">This is a test of the dashboard layout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <Card className="sticky top-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Course Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{currentIdx + 1} of {lessons.length} lessons</span>
                    <span>{Math.round(progress)}% complete</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Course Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="font-bold text-blue-600 text-lg">{lessons.length}</div>
                      <div className="text-gray-600">Lessons</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="font-bold text-green-600 text-lg">{completedLessons.size}</div>
                      <div className="text-gray-600">Completed</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    Lessons
                  </h3>
                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {lessons.map((lesson, idx) => {
                      const status = getLessonStatus(idx);
                      return (
                        <div
                          key={idx}
                          className={getLessonClassName(status)}
                        >
                          <div className="flex items-center gap-3">
                            {status === 'current' ? (
                              <PlayCircle className="w-4 h-4" />
                            ) : status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          {status === 'current' && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          <main className="lg:col-span-3 space-y-6">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        Lesson {currentIdx + 1}
                      </Badge>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <Clock className="w-3 h-3 mr-1" />
                        20 min
                      </Badge>
                      <Badge variant="outline" className="text-purple-600 border-purple-200">
                        <Users className="w-3 h-3 mr-1" />
                        150 students
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                      State and Lifecycle
                    </CardTitle>
                    <p className="text-gray-600 text-lg leading-relaxed mb-4">
                      Learn about React state management and component lifecycle methods.
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setLessonRating(star)}
                            className={`text-lg ${star <= lessonRating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                          >
                            <Star className="w-5 h-5 fill-current" />
                          </button>
                        ))}
                        <span className="text-sm text-gray-600 ml-2">({lessonRating}/5)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  Video Lesson
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <div className="w-full aspect-video bg-gray-800 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Video Player Placeholder</p>
                      <p className="text-sm opacity-75">This would show the actual video content</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Lesson Assessment
                </CardTitle>
                <p className="text-gray-600">Test your understanding of this lesson with our interactive assessment.</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Ready to Test Your Knowledge?</h3>
                  <p className="text-gray-600 mb-6">Complete this assessment to reinforce what you've learned.</p>
                  <Button 
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Start Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
} 