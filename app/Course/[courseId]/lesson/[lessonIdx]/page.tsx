"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
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
  Loader2,
  Volume2,
  Maximize2,
  Pause
} from 'lucide-react';
import CourseCompletionCertificate from '@/components/CourseCompletionCertificate';
import { useSession } from 'next-auth/react';
import { getSession } from 'next-auth/react';

// YouTube API TypeScript declarations
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function LessonDetailPage({ params }: { params: Promise<{ courseId: string, lessonIdx: string }> }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [resolvedParams, setResolvedParams] = useState<{ courseId: string; lessonIdx: string } | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [courseProgress, setCourseProgress] = useState<any>(null);
  const [showCompletionCertificate, setShowCompletionCertificate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Test embed states
  const [embedCode, setEmbedCode] = useState<string | null>(null);
  const [loadingEmbed, setLoadingEmbed] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [uniqueCode, setUniqueCode] = useState<string | null>(null);
  
  // YouTube player states
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [showControls, setShowControls] = useState(true);
  const playerRef = useRef<HTMLDivElement>(null);

  // Add error boundary
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Global error caught:', error);
      setError(error.message);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Add unhandled promise rejection handler
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setError('An unexpected error occurred. Please refresh the page.');
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  // Resolve params
  useEffect(() => {
    try {
      params.then(setResolvedParams).catch(err => {
        console.error('Error resolving params:', err);
        setError('Failed to load lesson parameters');
      });
    } catch (err) {
      console.error('Error in params effect:', err);
      setError('Failed to initialize lesson');
    }
  }, [params]);

  // Load YouTube API
  useEffect(() => {
    try {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        
        window.onYouTubeIframeAPIReady = () => {
          console.log('YouTube API ready');
        };
      }
    } catch (err) {
      console.error('Error loading YouTube API:', err);
    }
  }, []);

  // Fetch course progress when course data is available
  const fetchCourseProgress = useCallback(async () => {
    if (resolvedParams?.courseId && session?.user) {
      console.log('Fetching course progress for:', resolvedParams.courseId);
      try {
        const response = await fetch(`/api/courses/${resolvedParams.courseId}/complete`);
        if (response.ok) {
          const data = await response.json();
          setCourseProgress(data.courseProgress);
          
          // Update completed lessons from progress
          if (data.courseProgress.lessons) {
            const completed = new Set<number>();
            data.courseProgress.lessons.forEach((lesson: any) => {
              if (lesson.completed) {
                completed.add(lesson.lessonIndex);
              }
            });
            setCompletedLessons(completed);
          }
        }
      } catch (error) {
        console.error('Error fetching course progress:', error);
      }
    }
  }, [resolvedParams?.courseId, session?.user]);

  useEffect(() => {
    if (resolvedParams?.courseId && session?.user) {
      fetchCourseProgress();
    }
  }, [resolvedParams?.courseId, session?.user, fetchCourseProgress]);

  // Fetch course and lesson data
  useEffect(() => {
    const fetchData = async () => {
      if (!resolvedParams) return;
      
      try {
        console.log('Fetching course and lesson data...');
        setLoading(true);
        setError(null);
        
        const [courseResponse, lessonResponse] = await Promise.all([
          fetch(`/api/courses/${resolvedParams.courseId}`),
          fetch(`/api/courses/${resolvedParams.courseId}/lesson/${resolvedParams.lessonIdx}`)
        ]);

        if (!courseResponse.ok || !lessonResponse.ok) {
          throw new Error('Failed to fetch course or lesson data');
        }

        const [courseData, lessonData] = await Promise.all([
          courseResponse.json(),
          lessonResponse.json()
        ]);

        // Check if course is active - redirect if inactive
        if (courseData.status === 'inactive') {
          toast.error('This course is currently unavailable.');
          router.push('/Course');
          return;
        }

        console.log('Course data:', courseData);
        console.log('Lesson data:', lessonData);
        console.log('Resolved params:', resolvedParams);
        console.log('Setting currentLessonIndex to:', parseInt(resolvedParams.lessonIdx));

        setCourse(courseData);
        setLesson(lessonData);
        setCurrentLessonIndex(parseInt(resolvedParams.lessonIdx));
        
        // Debug: Log the lesson structure
        if (courseData.lessons) {
          console.log('Course lessons array:', courseData.lessons);
          console.log('Total lessons:', courseData.lessons.length);
          console.log('Current lesson index:', parseInt(resolvedParams.lessonIdx));
          console.log('Is last lesson:', parseInt(resolvedParams.lessonIdx) >= courseData.lessons.length - 1);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams]);

  // Initialize YouTube player when lesson data is available
  useEffect(() => {
    if (lesson?.embedCode && window.YT && playerRef.current) {
      const videoId = extractVideoId(lesson.embedCode);
      if (videoId) {
        const player = new window.YT.Player(playerRef.current, {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            controls: 0, // Hide YouTube controls
            disablekb: 1, // Disable keyboard controls
            fs: 0, // Disable fullscreen button
            rel: 0, // Don't show related videos
            showinfo: 0, // Don't show video info
            modestbranding: 1, // Hide YouTube logo
            iv_load_policy: 3, // Hide video annotations
            cc_load_policy: 0, // Hide closed captions
            autoplay: 0, // Don't autoplay
            mute: 0, // Don't start muted
            playsinline: 1, // Play inline on mobile
            origin: window.location.origin, // Set origin for security
            enablejsapi: 1, // Enable JavaScript API
            widget_referrer: window.location.origin, // Set referrer
            hl: 'en', // Set language
            color: 'white', // Set player color
            theme: 'dark', // Set theme
          },
          events: {
            onReady: (event: any) => {
              console.log('Player ready');
              const player = event.target;
              setYoutubePlayer(player);
              setDuration(player.getDuration());
              
              // Hide YouTube UI elements using API methods
              try {
                // Hide the large play button
                player.setOption('showinfo', 0);
                player.setOption('controls', 0);
                
                // Additional options to hide UI elements
                player.setOption('iv_load_policy', 3);
                player.setOption('cc_load_policy', 0);
                player.setOption('rel', 0);
                player.setOption('modestbranding', 1);
                
                // Force hide the large play button by clicking it once
                setTimeout(() => {
                  if (player.getPlayerState() === -1) { // -1 means unstarted
                    player.playVideo();
                    setTimeout(() => {
                      player.pauseVideo();
                    }, 100);
                  }
                }, 500);
              } catch (error) {
                console.log('Some YouTube options not available:', error);
              }
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              }
            },
          },
        });
      }
    }
  }, [lesson?.embedCode]);

  // Update current time
  useEffect(() => {
    if (youtubePlayer && isPlaying) {
      const interval = setInterval(() => {
        if (youtubePlayer.getCurrentTime) {
          setCurrentTime(youtubePlayer.getCurrentTime());
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [youtubePlayer, isPlaying]);

  // Helper function to extract video ID from embed code
  const extractVideoId = (embedCode: string): string | null => {
    const match = embedCode.match(/embed\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  // Helper function to format time in MM:SS format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleNextLesson = async () => {
    if (!resolvedParams) return;
    
    // Mark current lesson as completed first
    await markLessonCompleted();
    
    if (course?.lessons && currentLessonIndex < course.lessons.length - 1) {
      // Go to next lesson
      const nextIndex = currentLessonIndex + 1;
      window.location.href = `/Course/${resolvedParams.courseId}/lesson/${nextIndex}`;
    } else if (course?.lessons && currentLessonIndex >= course.lessons.length - 1) {
      // This is the last lesson, course should already be completed from markLessonCompleted
      // Just show the completion certificate
      if (courseProgress?.isCompleted) {
        setShowCompletionCertificate(true);
      }
    }
  };

  const markLessonCompleted = async () => {
    console.log('=== markLessonCompleted called ===');
    console.log('Session object:', session);
    console.log('Session status:', status);
    console.log('Session user:', session?.user);
    console.log('Resolved params:', resolvedParams);
    
    // Check if session is still loading
    if (status === 'loading') {
      console.log('Session is still loading, please wait...');
      toast.error('Please wait for session to load...');
      return;
    }
    
    if (!session?.user || !resolvedParams?.courseId) {
      console.log('Session or params validation failed');
      toast.error('Please log in to save progress');
      return;
    }

    // Validate session before making API call
    if (status !== 'authenticated') {
      console.log('Session status is not authenticated:', status);
      toast.error('Session expired. Please log in again.');
      router.push('/login');
      return;
    }

    // Check if user has either email or phone number
    const userEmail = session.user.email;
    const userPhoneNumber = (session.user as any).phoneNumber;
    
    if (!userEmail && !userPhoneNumber) {
      console.log('No user identification found in session');
      toast.error('User identification not found. Please log in again.');
      router.push('/login');
      return;
    }

    try {
      setIsLoading(true);
      
      // Double-check session before making API call
      console.log('Double-checking session before API call...');
      console.log('Current session status:', status);
      console.log('Current session object:', session);
      console.log('User email:', userEmail);
      console.log('User phone number:', userPhoneNumber);
      
      // Try to refresh the session to ensure we have the latest data
      try {
        const freshSession = await getSession();
        console.log('Fresh session from getSession():', freshSession);
        
        if (freshSession?.user?.email || (freshSession?.user as any)?.phoneNumber) {
          console.log('Using fresh session identification:', {
            email: freshSession?.user?.email,
            phoneNumber: (freshSession?.user as any)?.phoneNumber
          });
        } else {
          console.log('Fresh session is invalid, using current session');
        }
      } catch (error) {
        console.log('Error refreshing session:', error);
      }
      
      if (status !== 'authenticated' || (!userEmail && !userPhoneNumber)) {
        console.log('Session validation failed before API call');
        toast.error('Session expired. Please log in again.');
        router.push('/login');
        return;
      }
      
      // Add a small delay to ensure session is stable
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const requestBody = {
        lessonIndex: currentLessonIndex,
        userEmail: userEmail,
        userPhoneNumber: userPhoneNumber,
      };
      
      console.log('Request body being sent:', requestBody);
      console.log('User identification from session:', { email: userEmail, phoneNumber: userPhoneNumber });
      console.log('Request body JSON stringified:', JSON.stringify(requestBody));
      
      // Test the fetch request
      console.log('Making fetch request to:', `/api/courses/${resolvedParams.courseId}/complete`);
      console.log('Fetch options:', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });
      
      const response = await fetch(`/api/courses/${resolvedParams.courseId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        setCourseProgress(data.courseProgress);
        
        // Update completed lessons
        setCompletedLessons(prev => new Set([...prev, currentLessonIndex]));
        
        // Check if course is completed
        if (data.courseProgress.isCompleted) {
          toast.success('🎉 Congratulations! Course completed successfully!');
          setShowCompletionCertificate(true);
        } else {
          toast.success('Lesson completed! Progress saved.');
        }
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        if (response.status === 401) {
          toast.error('Authentication failed. Please log in again and try completing the course.');
          // Optionally redirect to login
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          toast.error(errorData.error || 'Failed to save progress');
        }
      }
    } catch (error) {
      console.error('Error marking lesson completed:', error);
      toast.error('Failed to save progress. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevLesson = () => {
    if (!resolvedParams) return;
    
    if (currentLessonIndex > 0) {
      const prevIndex = currentLessonIndex - 1;
      window.location.href = `/Course/${resolvedParams.courseId}/lesson/${prevIndex}`;
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

  const progressPercentage = course?.lessons ? ((currentLessonIndex + 1) / course.lessons.length) * 100 : 0;

  // Now all the conditional returns can happen
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading session...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md border border-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access this lesson.</p>
            <Link href="/login">
              <Button className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700">
                <span className="font-semibold">Log In</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md border border-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Error Loading Lesson</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700"
            >
              <span className="font-semibold">Retry</span>
            </Button>
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
            <Link href="/home">
              <Button className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700">
                <span className="font-semibold">Return to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex h-[90vh] my-8 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-100 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed h-full rounded-r-3xl md:rounded-3xl inset-y-0 left-0 z-30 w-80 bg-white dark:bg-gray-800/90 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
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

          
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full h-full overflow-y-scroll lg:ml-8">
        {/* Top Navigation Bar */}
        <div className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 rounded-3xl ">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
                onClick={handlePrevLesson}
                disabled={currentLessonIndex === 0 || isLoading}
                className="flex items-center gap-2"
              >
                <span className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous <span className="hidden lg:inline">Lesson</span> </span>
                </span>
              </Button>
              
              <Button
                onClick={handleNextLesson}
                disabled={!course.lessons || currentLessonIndex >= course.lessons.length - 1 || isLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <span className="flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : currentLessonIndex >= (course.lessons?.length || 0) - 1 ? (
                    <span>Complete <span className="hidden lg:inline">Course</span></span>
                  ) : (
                    <span>Next <span className="hidden lg:inline">Lesson</span></span>
                  )}
                  {!isLoading && <ChevronRight className="w-4 h-4" />}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="w-[100%] py-7 ">
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
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-4">{lesson.title}</h1>
            <p className="text-lg text-gray-600 leading-relaxed">{lesson.description}</p>
          </div>

          {/* Video Section */}
          {(lesson.video || lesson.embedCode) ? (
            <Card className="mb-8 border-0 shadow-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  Video Lesson
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  {lesson.video && lesson.video.startsWith('http') ? (
                    <video 
                      className="absolute inset-0 w-full h-full" 
                      controls 
                      playsInline
                      preload="metadata"
                      onError={(e) => console.error('Video error:', e)}
                      onLoadStart={() => console.log('Video loading started')}
                      onCanPlay={() => console.log('Video can play')}
                    >
                      <source src={lesson.video} type="video/mp4" />
                      <source src={lesson.video} type="video/webm" />
                      <source src={lesson.video} type="video/ogg" />
                      <p className="text-white text-center p-4">Your browser does not support the video tag or the video failed to load.</p>
                    </video>
                  ) : lesson.embedCode ? (
                    <div className="relative w-full h-full">
                      {/* YouTube API Player */}
                      <div 
                        ref={playerRef}
                        className="absolute inset-0 w-full h-full"
                      />
                      
                      {/* Custom Video Controls Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-300">
                        <div className="flex items-center gap-4 text-white">
                          {/* Play/Pause Button */}
                          <button
                            onClick={() => {
                              if (youtubePlayer) {
                                if (isPlaying) {
                                  youtubePlayer.pauseVideo();
                                } else {
                                  youtubePlayer.playVideo();
                                }
                              }
                            }}
                            className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                          >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </button>
                          
                          {/* Progress Bar */}
                          <div className="flex-1">
                            <Slider
                              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                              max={100}
                              step={0.1}
                              className="w-full"
                              onValueChange={(value: number[]) => {
                                if (youtubePlayer && duration > 0) {
                                  const seekTime = (value[0] / 100) * duration;
                                  youtubePlayer.seekTo(seekTime);
                                  setCurrentTime(seekTime);
                                }
                              }}
                            />
                          </div>
                          
                          {/* Time Display */}
                          <div className="text-sm font-mono min-w-[80px] text-center">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </div>
                          
                          {/* Volume Control */}
                          <div className="flex items-center gap-2">
                            <Volume2 className="w-4 h-4" />
                            <Slider
                              value={[volume]}
                              max={100}
                              step={1}
                              className="w-20"
                              onValueChange={(value: number[]) => {
                                const newVolume = value[0];
                                setVolume(newVolume);
                                if (youtubePlayer) {
                                  youtubePlayer.setVolume(newVolume);
                                }
                              }}
                            />
                          </div>
                          
                          {/* Fullscreen Button */}
                          <button
                            onClick={() => {
                              if (playerRef.current && playerRef.current.requestFullscreen) {
                                playerRef.current.requestFullscreen();
                              }
                            }}
                            className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                          >
                            <Maximize2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white">
                      <Video className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">No Video Available</p>
                      <p className="text-sm text-gray-300">This lesson doesn't have video content yet.</p>
                    </div>
                  )}
                </div>
                
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8 border-0 shadow-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-gray-400" />
                  Video Lesson
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Video Available</h3>
                  <p className="text-gray-600 dark:text-gray-400">This lesson doesn't have video content yet.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Section */}
          <Card className="w-full border-0 shadow-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Lesson Test
              </CardTitle>
              <CardDescription>
                Complete this test to mark the lesson as finished
              </CardDescription>
            </CardHeader>
            <CardContent className='p-0 h-full'>
              {lesson.testEmbedCode ? (
                !showEmbed ? (
                  <div className="w-full text-center p-8">
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
                  <div className="space-y-4 p-0">
                    {/* Unique Code Display */}
                    {uniqueCode && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-0 md:p-4">
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
                      <div className="text-center w-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading test...</p>
                      </div>
                    ) : embedCode ? (
                      <div 
                        className="h-[50vh] md:h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden"
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
                            
                            // Ensure iframes/videos fill container and allow fullscreen
                            const mediaElements = el.querySelectorAll('iframe, video');
                            mediaElements.forEach((mediaEl: any) => {
                              mediaEl.style.width = '100%';
                              mediaEl.style.height = '100%';
                              mediaEl.setAttribute('allowFullScreen', '');
                              mediaEl.setAttribute('playsInline', '');
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
              disabled={currentLessonIndex === 0 || isLoading}
              className="flex items-center gap-2"
            >
              <span className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Previous <span className="hidden lg:inline">Lesson</span></span>
              </span>
            </Button>
            
            <span className="text-sm text-gray-600">
              {currentLessonIndex + 1} of {course.lessons?.length || 0} <span className="hidden lg:inline">lessons</span>
            </span>
            
            <div className="flex items-center gap-4">
              {/* Show "Complete Course" button for last lesson, "Next Lesson" for others */}
              {course?.lessons && currentLessonIndex >= (course.lessons.length - 1) ? (
                // Last lesson - Show Complete Course button
                <Button
                  onClick={markLessonCompleted}
                  disabled={isLoading || status !== 'authenticated'}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <span className="flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Completing Course...</span>
                      </>
                    ) : status !== 'authenticated' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading Session...</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-4 h-4" />
                        <span>Complete Course</span>
                      </>
                    )}
                  </span>
                </Button>
              ) : (
                // Not last lesson - Show Next Lesson button
                <Button
                  onClick={handleNextLesson}
                  disabled={isLoading || !course?.lessons || status !== 'authenticated'}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <span className="flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : status !== 'authenticated' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>Next <span className="hidden lg:inline">Lesson</span></span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Completion Certificate */}
      {showCompletionCertificate && (
        <CourseCompletionCertificate
          isOpen={showCompletionCertificate}
          onClose={() => setShowCompletionCertificate(false)}
          courseId={resolvedParams?.courseId}
          courseName={course?.title || 'Course'}
          courseDescription={course?.description || ''}
          totalLessons={course?.lessons?.length || 0}
          completedLessons={courseProgress?.completedLessons || 0}
          userEmail={(session?.user as any)?.email}
          userPhoneNumber={(session?.user as any)?.phoneNumber}
        />
      )}
    </div>
  );
} 
