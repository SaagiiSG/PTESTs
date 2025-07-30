"use client";
import React, { useEffect, useState, useRef } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Link from 'next/link';
import { Play, Pause, Volume2, VolumeX, Maximize2, SkipForward, SkipBack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LessonDetailPage({ params }: { params: Promise<{ courseId: string, lessonIdx: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ courseId: string; lessonIdx: string } | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(true);
  const [showTest, setShowTest] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [testEmbedLoading, setTestEmbedLoading] = useState(false);
  const testEmbedRef = useRef<HTMLDivElement>(null);

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
      } catch (e) {
        setLesson(null);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [resolvedParams]);

  useEffect(() => {
    if (showTest && testEmbedLoading && lesson?.embedCode) {
      const div = testEmbedRef.current;
      if (div) {
        const iframe = div.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => setTestEmbedLoading(false);
          if (iframe.contentWindow?.document.readyState === 'complete') {
            setTestEmbedLoading(false);
          }
        } else {
          setTimeout(() => setTestEmbedLoading(false), 2000);
        }
      }
    }
  }, [showTest, testEmbedLoading, lesson?.embedCode]);

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTestLoad = () => {
    setTestLoading(false);
  };

  const handleShowTest = () => {
    setTestEmbedLoading(true);
    setShowTest(true);
  };

  if (loading || !resolvedParams) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Lesson Not Found</h2>
            <p className="text-gray-600 mb-4">The lesson you're looking for doesn't exist.</p>
            <Link href="/Course">
              <Button>Back to Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lessons = course.lessons || [];
  const currentIdx = parseInt(resolvedParams.lessonIdx, 10);
  const progress = lessons.length > 0 ? ((currentIdx + 1) / lessons.length) * 100 : 0;

  // Debugging logs
  console.log('lesson:', lesson);
  console.log('course:', course);
  console.log('lessons[currentIdx]?.title:', lessons[currentIdx]?.title);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs - Fixed positioning */}
        <div className="mb-8">
          <Breadcrumbs courseName={course?.title} lessonName={lessons[currentIdx]?.title} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1"> 
            <Card className="sticky top-8 py-6">
              <CardHeader>
                <CardTitle className="text-lg">Course Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {currentIdx + 1} of {lessons.length} lessons
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 text-gray-800">Lessons</h3>
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {lessons.map((l: any, idx: number) => (
                      <Link
                        key={idx}
                        href={`/Course/${resolvedParams.courseId}/lesson/${idx}`}
                        className={`block px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                          ${idx === currentIdx 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md' 
                            : 'hover:bg-yellow-50 text-gray-700 hover:text-gray-900'
                          }`}
                      >
                        {l.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3">
            <Card className="mb-8 py-4">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-800">{lesson.title}</CardTitle>
                <p className="text-gray-600 text-lg leading-relaxed">{lesson.description}</p>
              </CardHeader>
            </Card>

            {/* Video Section */}
            {lesson.video && (
              <Card className="mb-8 overflow-hidden pt-6">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Video Lesson</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    {lesson.video.startsWith('http') ? (
                      <>
                        <video
                          ref={videoRef}
                          className="w-full h-auto"
                          onLoadedMetadata={handleVideoLoad}
                          onTimeUpdate={handleTimeUpdate}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                        >
                          <source src={lesson.video} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        
                        {/* Custom Video Controls */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={togglePlay}
                              className="text-white hover:bg-white/20"
                            >
                              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </Button>
                            
                            <div className="flex-1">
                              <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                              />
                            </div>
                            
                            <div className="text-white text-sm min-w-[60px]">
                              {formatTime(currentTime)} / {formatTime(duration)}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={toggleMute}
                              className="text-white hover:bg-white/20"
                            >
                              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => videoRef.current?.requestFullscreen()}
                              className="text-white hover:bg-white/20"
                            >
                              <Maximize2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </>
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
            <Card className='py-6'>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Lesson Test</CardTitle>
                <p className="text-gray-600">Complete the test to check your understanding of this lesson.</p>
              </CardHeader>
              <CardContent>
                {!showTest ? (
                  <div className="text-center py-12">
                    <Button 
                      onClick={handleShowTest}
                      className="w-full py-3 text-lg font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                    >
                      Start Test
                    </Button>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    {testEmbedLoading && (
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                      </div>
                    )}
                    <Button className='relative'>
                      Start Test
                    <div
                      className='text-transparent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10'
                      ref={testEmbedRef}
                      dangerouslySetInnerHTML={{ __html: lesson.embedCode || '<p>No test available for this lesson.</p>' }}
                    />
                    </Button>
                  </div>
                  
                )}
              </CardContent>
            </Card>
            
          </main>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
} 