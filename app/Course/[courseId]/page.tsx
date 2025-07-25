"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Image from 'next/image';
import { Play, BookOpen, Clock, Users, Star, Lock, ChevronRight } from 'lucide-react';


export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${params.courseId}`);
        if (!res.ok) throw new Error('Failed to fetch course');
        const data = await res.json();
        setCourse(data);
      } catch (e) {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [params.courseId]);

  const handleBuyCourse = () => {
    router.push(`/pay/${params.courseId}?returnTo=/course/${params.courseId}`);
  };

  const isPaid = searchParams.get('paid') === '1';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
            <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
            <Link href="/Course">
              <Button>Back to Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lessons = course.lessons || [];
  const totalLessons = lessons.length;
  const estimatedHours = Math.ceil(totalLessons * 0.5); // Rough estimate
  const testCount = lessons.filter((l: any) => l.embedCode && l.embedCode.trim() !== '').length;

  // For now, always show continue if paid and there is at least one lesson
  const canContinue = isPaid && totalLessons > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 justify-center max-w-7xl mx-auto">
          {/* Left Column - Course Info & Stats */}
          <div className="lg:w-[80%]">
            <Card className="bg-white border-gray-200 mb-6">
              <CardContent className="p-6">
                {/* Course Thumbnail */}
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-6">
                  <Image
                    src={course.thumbnailUrl || "/ppnim_logo.svg"}
                    alt={course.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                
                <CardTitle className="text-3xl font-bold text-gray-800 mb-4">{course.title}</CardTitle>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">{course.description}</p>
                
                {/* Course Stats */}
                <div className="flex flex-row flex-wrap gap-4 justify-between">
                  <div className="w-[30%] text-center p-4 bg-gray-50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Lessons</div>
                    <div className="text-lg font-semibold text-gray-800">{totalLessons}</div>
                  </div>
                  <div className="w-[30%] text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Duration</div>
                    <div className="text-lg font-semibold text-gray-800">{estimatedHours}h</div>
                  </div>
                  <div className="w-[30%] text-center p-4 bg-gray-50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Tests</div>
                    <div className="text-lg font-semibold text-gray-800">{testCount}</div>
                  </div>
                  <div className="w-full text-center p-4 bg-yellow-50 rounded-lg flex flex-col items-center justify-center">
                    {canContinue ? (
                      <Link href={`/Course/${course._id}/lesson/0`}>
                        <Button className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-yellow-600 transition">
                          Continue
                          <ChevronRight />
                        </Button>
                        
                      </Link>
                    ) : (
                      <div className="flex flex-col items-center justify-center ">
                        <Lock className="w-6 h-6 text-gray-400 " />
                        <span className="text-gray-400 text-sm">Buy Course to unlock</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Purchase & Lessons */}
          <div className="lg:w-2/5">
            {/* Purchase Section */}
            <Card className="bg-white border-gray-200 mb-6">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-800 mb-2">₮{course.price}</div>
                  <div className="text-gray-600">One-time payment</div>
                </div>

                {!isPaid ? (
                  <Button 
                    onClick={handleBuyCourse}
                    className="w-full py-3 text-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-white shadow"
                  >
                    Buy Course
                  </Button>
                ) : (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-green-700 font-semibold mb-2">✓ Course Purchased</div>
                    <p className="text-sm text-green-700">You have full access to all lessons</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lessons Section */}
            <Card className="bg-white border-gray-200 py-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Play className="w-5 h-5 text-yellow-500" />
                  Course Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(!lessons || lessons.length === 0) ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No lessons available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lessons.map((lesson: any, idx: number) => (
                      <div key={idx} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                        {!isPaid ? (
                          <div className="flex items-center justify-between opacity-60">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-semibold text-gray-500">
                                  {idx + 1}
                                </div>
                                <h3 className="font-medium text-gray-700 text-sm">{lesson.title}</h3>
                              </div>
                            </div>
                            <div className="text-gray-400 text-xs">Locked</div>
                          </div>
                        ) : (
                          <Link href={`/Course/${course._id}/lesson/${idx}`} className="block group">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-semibold text-white">
                                    {idx + 1}
                                  </div>
                                  <h3 className="font-medium text-gray-800 group-hover:text-yellow-600 transition-colors text-sm">
                                    {lesson.title}
                                  </h3>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 text-xs"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Start
                              </Button>
                            </div>
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
