"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Clock, GraduationCap, DollarSign, Lock, ChevronRight, ArrowLeft, CheckCircle, Star, Users, Award, BookOpen, Target, Zap, Shield, Globe, Heart, CreditCard } from 'lucide-react';
import PaymentOptionsModal from '@/components/PaymentOptionsModal';
import { toast } from 'sonner';

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ courseId: string } | null>(null);
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [hoveredLesson, setHoveredLesson] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;
    const fetchData = async () => {
      try {
        const [courseRes, purchaseRes] = await Promise.all([
          fetch(`/api/courses/${resolvedParams.courseId}`),
          fetch('/api/profile/purchased-courses')
        ]);
        
        if (!courseRes.ok) throw new Error('Failed to fetch course');
        const courseData = await courseRes.json();
        setCourse(courseData);
        
        // Fetch lessons if they exist in the course data
        if (courseData.lessons && Array.isArray(courseData.lessons)) {
          setLessons(courseData.lessons);
        }

        // Check if course is purchased
        if (purchaseRes.ok) {
          const purchaseData = await purchaseRes.json();
          const purchased = purchaseData.courses?.some((p: any) => p.course?._id === resolvedParams.courseId);
          setIsPurchased(purchased);
        }
      } catch (e) {
        setCourse(null);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [resolvedParams]);

  const handlePaymentSuccess = (paymentData: any) => {
    setIsPurchased(true);
    toast.success('Payment successful! You now have access to this course.');
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  // Mock data for enhanced features
  const courseStats = {
    students: 1247,
    rating: 4.8,
    reviews: 89,
    completionRate: 94,
    lastUpdated: '2 weeks ago'
  };

  if (loading || !resolvedParams) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading amazing course...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Course Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">The course you're looking for doesn't exist.</p>
            <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero Section with Background Pattern */}
      <div className="relative">
        <div className="absolute inset-0 "></div>
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(156, 146, 172, 0.1) 0%, transparent 50%)`
        }}></div>
        
        <div className="relative p-6">
          <div className="max-w-7xl mx-auto">
        
            

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left Column - Course Info & Buy Section (60%) */}
              <div className="lg:col-span-3 space-y-6">
                {/* Course Card */}
                <Card className="overflow-hidden border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
                  {/* Image Section */}
                  <div className="relative w-full h-56 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                    <img 
                      src={course.thumbnailUrl || "/ppnim_logo.svg"} 
                      alt={course.title}
                      className="w-full h-full object-cover mix-blend-overlay" 
                    />
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent animate-pulse"></div>
                    
                    {/* Floating play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 transform hover:scale-110 transition-all duration-300 shadow-2xl">
                        <Play className="w-8 h-8 text-blue-600 ml-1" fill="currentColor" />
                      </div>
                    </div>
                    
                    {/* Price badge with animation */}
                    {typeof course.price === 'number' && (
                      <div className="absolute top-4 right-4 transform hover:scale-110 transition-all duration-300">
                        <Badge className="bg-white/95 backdrop-blur-sm text-gray-900 dark:text-white dark:bg-gray-800/95 font-bold px-4 py-2 shadow-xl border-2 border-yellow-400">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {course.price}
                        </Badge>
                      </div>
                    )}

                    {/* Course rating */}
                    <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{courseStats.rating}</span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <CardContent className="p-6">
                    {/* Title with gradient text */}
                    <CardTitle className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                      <BookOpen className="w-6 h-6" />
                      {course.title}
                    </CardTitle>
                    
                    {/* Description */}
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 leading-relaxed flex items-start gap-2">
                      <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{course.description}</span>
                    </CardDescription>

                    {/* Enhanced Course Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{lessons.length}</span>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300">Lessons</span>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Self-paced</span>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300">Learning</span>
                      </div>
                    </div>

                    {/* Course Description */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        What you'll learn:
                      </h4>
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex items-start gap-2">
                          <Shield className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <span>{course.description}</span>
                        </p>
                      </div>
                    </div>

                    {/* Buy Section */}
                    {course.price && !isPurchased && (
                      <div className="space-y-4">
                        <Button 
                          onClick={() => setShowPaymentModal(true)}
                          className="my-3 mb-5 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          <span className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Enroll Now - ₮{course.price}
                          </span>
                        </Button>
                        <div className="text-center space-y-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                            <span>One-time payment</span>
                            <span>•</span>
                            <span>Lifetime access</span>
                          </p>
                          <div className="flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {courseStats.students} students
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              {courseStats.completionRate}% completion
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {isPurchased && (
                      <div className="space-y-4">
                        <Link href={`/Course/${resolvedParams.courseId}/lesson/0`} className="w-full">
                          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                            <span className="flex items-center gap-2">
                              <Play className="w-5 h-5 mr-2" />
                              Continue Learning
                            </span>
                          </Button>
                        </Link>
                        <div className="mt-6 flex items-center justify-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-semibold">Course Purchased</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Course Details */}
                {course.details && (
                  <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Course Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: course.details }}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Lessons Preview (40%) */}
              <div className="lg:col-span-2">
                {/* Lessons Preview */}
                <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                      <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      Course Content
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {lessons.length} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Self-paced
                      </span>
                      {isPurchased && (
                        <div className="flex items-center gap-2">
                          <Progress value={25} className="w-16 h-2" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">25% Complete</span>
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {lessons.length > 0 ? (
                      <div className="space-y-1">
                        {lessons.map((lesson: any, index: number) => (
                          <div 
                            key={index} 
                            className={`flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                              index !== lessons.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                            } ${hoveredLesson === index ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20' : ''}`}
                            onMouseEnter={() => setHoveredLesson(index)}
                            onMouseLeave={() => setHoveredLesson(null)}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* Animated Lesson Number */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                isPurchased 
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                              } ${hoveredLesson === index ? 'scale-110' : ''}`}>
                                {index + 1}
                              </div>
                              
                              {/* Lesson Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 transition-colors duration-300 text-sm">
                                  {lesson.title}
                                </h3>
                                {lesson.description && (
                                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1 mt-1">
                                    {lesson.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                    <Play className="w-3 h-3" />
                                    <span>Video</span>
                                  </span>
                                  <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>15 min</span>
                                  </span>
                                  {isPurchased && (
                                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      Available
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex items-center gap-2">
                              {isPurchased ? (
                                <Link href={`/Course/${resolvedParams.courseId}/lesson/${index}`}>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 transition-all duration-300 transform hover:scale-105"
                                  >
                                    <span className="flex items-center gap-2">
                                      <Play className="w-3 h-3 mr-1" />
                                      <span>Start</span>
                                    </span>
                                  </Button>
                                </Link>
                              ) : (
                                <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                  <Lock className="w-3 h-3" />
                                  <span className="text-xs font-medium">Locked</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm font-medium">No lessons available yet</p>
                        <p className="text-xs mt-1">Check back soon for new content!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Options Modal */}
      <PaymentOptionsModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        itemId={resolvedParams?.courseId || ''}
        itemType="course"
        itemTitle={course?.title || ''}
        itemDescription={course?.description || ''}
        price={course?.price || 0}
        thumbnailUrl={course?.thumbnailUrl}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  );
} 