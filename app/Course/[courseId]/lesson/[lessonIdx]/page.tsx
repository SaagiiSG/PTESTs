"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Lock, 
  Menu, 
  X,
  GraduationCap,
  Target,
  Award,
  ArrowLeft,
  Video,
  FileText,
  Users,
  Star,
  Loader2
} from 'lucide-react';

export default function LessonDetailPage({ params }: { params: Promise<{ courseId: string, lessonIdx: string }> }) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ courseId: string; lessonIdx: string } | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set([0, 1])); // Mock completed lessons
  
  // Test embed states
  const [embedCode, setEmbedCode] = useState<string | null>(null);
  const [loadingEmbed, setLoadingEmbed] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [uniqueCode, setUniqueCode] = useState<string | null>(null);
  


  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;
    const fetchData = async () => {
      try {
        const [lessonRes, courseRes] = await Promise.all([
          fetch(`/api/courses/${resolvedParams.courseId}/lesson/${resolvedParams.lessonIdx}`),
          fetch(`/api/courses/${resolvedParams.courseId}`),
        ]);
        if (!lessonRes.ok || !courseRes.ok) throw new Error('Failed to fetch');
        const lessonData = await lessonRes.json();
        const courseData = await courseRes.json();
        setLesson(lessonData);
        setCourse(courseData);
        setCurrentLessonIndex(parseInt(resolvedParams.lessonIdx));
      } catch (e) {
        setLesson(null);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [resolvedParams]);

  const handleNextLesson = () => {
    if (course?.lessons && currentLessonIndex < course.lessons.length - 1) {
      const nextIndex = currentLessonIndex + 1;
      window.location.href = `/Course/${resolvedParams?.courseId}/lesson/${nextIndex}`;
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      const prevIndex = currentLessonIndex - 1;
      window.location.href = `/Course/${resolvedParams?.courseId}/lesson/${prevIndex}`;
    }
  };



  const isLessonCompleted = (index: number) => completedLessons.has(index);
  const isLessonAccessible = (index: number) => index === 0 || completedLessons.has(index - 1);

  // Function to load test embed
  const handleStartTest = async () => {
    if (!lesson.testEmbedCode) {
      toast.error('No test embed code available for this lesson');
      return;
    }
    
    setLoadingEmbed(true);
    setShowEmbed(true);
    
    try {
      console.log('🔍 Loading test embed code from lesson data');
      
      // Use the test embed code directly from the lesson
      if (lesson.testEmbedCode) {
        console.log('✅ Test embed code found in lesson data');
        setEmbedCode(lesson.testEmbedCode);
        setHasAccess(true); // Since it's part of the course, user has access
      } else {
        console.log('❌ No test embed code available');
        toast.error('No test content available for this lesson');
      }
    } catch (error) {
      console.error('Error loading test embed:', error);
      toast.error('Failed to load test');
    } finally {
      setLoadingEmbed(false);
    }
  };

  if (loading || !resolvedParams) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading lesson...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md border border-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Lesson Not Found</h2>
            <p className="text-gray-600 mb-6">The lesson you're looking for doesn't exist.</p>
            <Link href={`/Course/${resolvedParams?.courseId}`} className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              Back to Course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = course.lessons ? ((currentLessonIndex + 1) / course.lessons.length) * 100 : 0;

  return (
    <div className="flex h-[90vh] my-8 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed h-full rounded-3xl inset-y-0 left-0 z-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Link 
                href={`/Course/${resolvedParams.courseId}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-semibold">Back to Course</span>
              </Link>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-gray-900 line-clamp-2">{course.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  {course.lessons?.length || 0} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Self-paced
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>

          {/* Lessons List */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Course Content
            </h3>
            
            <div className="space-y-2">
              {course.lessons?.map((lessonItem: any, index: number) => {
                const isCompleted = isLessonCompleted(index);
                const isAccessible = isLessonAccessible(index);
                const isCurrent = index === currentLessonIndex;
                
                return (
                  <Link
                    key={index}
                    href={isAccessible ? `/Course/${resolvedParams.courseId}/lesson/${index}` : '#'}
                    className={`block p-3 rounded-lg transition-all duration-200 ${
                      isCurrent 
                        ? 'bg-blue-50 border border-blue-200' 
                        : isAccessible 
                          ? 'hover:bg-gray-50 border border-transparent hover:border-gray-200' 
                          : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={!isAccessible ? (e) => e.preventDefault() : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isCurrent 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-sm line-clamp-1 ${
                          isCurrent ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {lessonItem.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            Video
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            15 min
                          </span>
                        </div>
                      </div>

                      {!isAccessible && (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">Course Certificate</span>
              </div>
              <p className="text-xs text-gray-600">Complete all lessons to earn your certificate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-8 w-full h-full overflow-y-scroll">
        {/* Top Navigation Bar */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30 rounded-3xl ">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="hidden lg:flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Lesson {currentLessonIndex + 1} of {course.lessons?.length || 0}
                </span>
                <div className="w-32">
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevLesson}
                disabled={currentLessonIndex === 0}
                className="flex items-center gap-1"
              >
                <span className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextLesson}
                disabled={!course.lessons || currentLessonIndex >= course.lessons.length - 1}
                className="flex items-center gap-1"
              >
                <span className="flex items-center gap-2">
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="p-6 w-[100%] mx-auto py-7">
          {/* Lesson Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Badge variant="outline" className="text-xs">
                Lesson {currentLessonIndex + 1}
              </Badge>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                15 minutes
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{lesson.title}</h1>
            <p className="text-lg text-gray-600 leading-relaxed">{lesson.description}</p>
          </div>

          {/* Video Section */}
          {lesson.video && (
            <Card className="mb-8 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  Video Lesson
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-black rounded-lg overflow-hidden">
                  {lesson.video.startsWith('http') ? (
                    <video className="w-full h-auto" controls>
                      <source src={lesson.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div 
                      className="w-full aspect-video"
                      dangerouslySetInnerHTML={{ __html: lesson.video }} 
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Section */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Lesson Test
              </CardTitle>
              <CardDescription>
                Complete this test to mark the lesson as finished
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lesson.testEmbedCode ? (
                !showEmbed ? (
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Test?</h3>
                    <p className="text-gray-600 mb-6">Complete the lesson test to continue to the next lesson</p>
                    
                    <Button 
                      onClick={handleStartTest}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
                    >
                      <span className="flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        Start Test
                      </span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Unique Code Display */}
                    {uniqueCode && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">Your Access Code</h3>
                              <p className="text-xs text-green-600 dark:text-green-400">Use this code to access your test results</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-mono font-bold text-green-700 dark:text-green-300 bg-white dark:bg-gray-800 px-3 py-1 rounded border border-green-300 dark:border-green-700">
                              {uniqueCode}
                            </div>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(uniqueCode);
                                toast.success('Access code copied to clipboard!');
                              }}
                              className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 mt-1 underline"
                            >
                              Copy Code
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Test Embed */}
                    {loadingEmbed ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading test...</p>
                      </div>
                    ) : embedCode ? (
                      <div 
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-8"
                        style={{
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none',
                          msUserSelect: 'none'
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                        ref={(el) => {
                          if (el && embedCode) {
                            el.innerHTML = embedCode;
                            // Execute any scripts in the embed code
                            const scripts = el.querySelectorAll('script');
                            scripts.forEach(script => {
                              const newScript = document.createElement('script');
                              if (script.src) {
                                newScript.src = script.src;
                              } else {
                                newScript.textContent = script.textContent;
                              }
                              document.head.appendChild(newScript);
                            });
                          }
                        }}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">Failed to load test content</p>
                        <Button 
                          onClick={handleStartTest}
                          variant="outline"
                          className="mt-4"
                        >
                          Retry Loading Test
                        </Button>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No test available for this lesson.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Footer */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevLesson}
              disabled={currentLessonIndex === 0}
              className="flex items-center gap-2"
            >
              <span className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Lesson</span>
              </span>
            </Button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {currentLessonIndex + 1} of {course.lessons?.length || 0} lessons
              </span>
              
              <Button
                onClick={handleNextLesson}
                disabled={!course.lessons || currentLessonIndex >= course.lessons.length - 1}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <span className="flex items-center gap-2">
                  {currentLessonIndex >= (course.lessons?.length || 0) - 1 ? 'Complete Course' : 'Next Lesson'}
                  <ChevronRight className="w-4 h-4" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 