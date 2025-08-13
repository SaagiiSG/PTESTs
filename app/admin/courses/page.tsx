"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  Eye, 
  EyeOff,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Target,
  Award,
  Zap,
  GraduationCap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Video,
  FileText
} from 'lucide-react';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import CreateCourseModal from '@/components/CreateCourseModal';
import EditCourseModal from '@/components/EditCourseModal';
import EditLessonModal from '@/components/EditLessonModal';
import { toast } from 'sonner';

interface Lesson {
  _id?: string;
  title: string;
  description: string;
  embedCode: string;
  video?: string;
  testEmbedCode?: string;
  estimatedDuration?: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  lessons: Lesson[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

function CoursesPageContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [isBulkActionMode, setIsBulkActionMode] = useState(false);
  const [updatingCourseStatus, setUpdatingCourseStatus] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [courseRevenue, setCourseRevenue] = useState<number>(0);

  // Fetch real courses from API
  useEffect(() => {
    fetchCourses();
    fetchCourseRevenue();
  }, []);

  // Fetch real course revenue from payments
  const fetchCourseRevenue = async () => {
    try {
      // Get all payments and filter for course payments only
      const response = await fetch('/api/admin/analytics/payments');
      if (response.ok) {
        const data = await response.json();
        
        // Filter for course payments only (not test payments)
        let courseRevenue = 0;
        if (data.recentPayments) {
          data.recentPayments.forEach((payment: any) => {
            // Check if this payment is for a course (not a test)
            if (payment.courseId || payment.courseTitle || 
                (payment.itemType && payment.itemType === 'course') ||
                (payment.description && payment.description.toLowerCase().includes('course'))) {
              courseRevenue += payment.payment_amount || 0;
            }
          });
        }
        
        setCourseRevenue(courseRevenue);
      }
    } catch (error) {
      console.error('Failed to fetch course revenue:', error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'b') {
        event.preventDefault();
        setIsBulkActionMode(prev => !prev);
      }
      if (event.key === 'Escape' && isBulkActionMode) {
        setIsBulkActionMode(false);
        setSelectedCourses(new Set());
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isBulkActionMode]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array and has the expected structure
        if (Array.isArray(data)) {
          // Ensure all courses have a status field, defaulting to 'active'
          const coursesWithStatus = data.map(course => ({
            ...course,
            status: course.status || 'active' // Default to active if no status
          }));
          setCourses(coursesWithStatus);
        } else {
          console.error('Invalid courses data format:', data);
          setCourses([]);
          toast.error('Invalid data format received');
        }
      } else {
        console.error('Failed to fetch courses:', response.status, response.statusText);
        setCourses([]);
        toast.error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    if (!course || !course._id) {
      toast.error('Invalid course data');
      return;
    }
    setSelectedCourse(course);
    setIsEditCourseModalOpen(true);
  };

  const handleEditLesson = (course: Course, lesson: Lesson, lessonIndex: number) => {
    if (!course || !course._id || !lesson) {
      toast.error('Invalid lesson data');
      return;
    }
    setSelectedCourse(course);
    setSelectedLesson(lesson);
    setSelectedLessonIndex(lessonIndex);
    setIsEditLessonModalOpen(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!courseId) {
      toast.error('Invalid course ID');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Course deleted successfully!');
        fetchCourses(); // Refresh the list
      } else {
        toast.error('Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const handleDeleteLesson = async (courseId: string, lessonIndex: number) => {
    if (!courseId) {
      toast.error('Invalid course ID');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    try {
      const course = courses.find(c => c._id === courseId);
      if (!course) return;

      const updatedLessons = (course.lessons || []).filter((_, idx) => idx !== lessonIndex);
      
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessons: updatedLessons }),
      });
      
      if (response.ok) {
        toast.success('Lesson deleted successfully!');
        fetchCourses(); // Refresh the list
      } else {
        toast.error('Failed to delete lesson');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Failed to delete lesson');
    }
  };

  const handleLessonToggle = (courseId: string, lessonIndex: number, field: keyof Lesson, value: any) => {
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course._id === courseId 
          ? {
              ...course,
              lessons: (course.lessons || []).map((lesson, idx) => 
                idx === lessonIndex && lesson
                  ? { ...lesson, [field]: value }
                  : lesson
              )
            }
          : course
      )
    );
  };

  const handleToggleCourseStatus = async (courseId: string, newStatus: 'active' | 'inactive') => {
    if (!courseId) {
      toast.error('Invalid course ID');
      return;
    }

    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    const courseTitle = courses.find(c => c._id === courseId)?.title || 'this course';

    // Confirmation for deactivation
    if (newStatus === 'inactive') {
      const confirmed = confirm(`Are you sure you want to deactivate "${courseTitle}"? This will hide it from students but preserve all data.`);
      if (!confirmed) return;
    }

    // Set loading state
    setUpdatingCourseStatus(prev => new Set(prev).add(courseId));

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        toast.success(`Course "${courseTitle}" ${action}d successfully!`);
        // Update local state immediately for better UX
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course._id === courseId 
              ? { ...course, status: newStatus }
              : course
          )
        );
      } else {
        toast.error(`Failed to ${action} course`);
      }
    } catch (error) {
      console.error(`Error ${action}ing course:`, error);
      toast.error(`Failed to ${action} course`);
    } finally {
      // Clear loading state
      setUpdatingCourseStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  const handleBulkStatusUpdate = async (newStatus: 'active' | 'inactive') => {
    if (selectedCourses.size === 0) {
      toast.error('No courses selected');
      return;
    }

    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    const count = selectedCourses.size;

    // Confirmation for bulk deactivation
    if (newStatus === 'inactive') {
      const confirmed = confirm(`Are you sure you want to deactivate ${count} course${count > 1 ? 's' : ''}? This will hide them from students but preserve all data.`);
      if (!confirmed) return;
    }

    try {
      // Update local state immediately for better UX
      setCourses(prevCourses => 
        prevCourses.map(course => 
          selectedCourses.has(course._id || '') 
            ? { ...course, status: newStatus }
            : course
        )
      );

      const promises = Array.from(selectedCourses).map(courseId =>
        fetch(`/api/courses/${courseId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
      );

      const responses = await Promise.all(promises);
      const successCount = responses.filter(r => r.ok).length;

      if (successCount === count) {
        toast.success(`Successfully ${action}d ${count} course${count > 1 ? 's' : ''}!`);
      } else {
        toast.error(`Partially ${action}d courses. ${successCount}/${count} succeeded.`);
        // Refresh to get accurate state if there were failures
        fetchCourses();
      }

      // Clear selection and refresh
      setSelectedCourses(new Set());
      setIsBulkActionMode(false);
    } catch (error) {
      console.error(`Error bulk ${action}ing courses:`, error);
      toast.error(`Failed to ${action} courses`);
      // Refresh to get accurate state on error
      fetchCourses();
    }
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const handleSelectAllCourses = () => {
    if (selectedCourses.size === sortedCourses.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(new Set(sortedCourses.map(c => c._id)));
    }
  };

  const getLessonTypeIcon = (lesson: Lesson) => {
    if (!lesson) return <BookOpen className="w-4 h-4 text-gray-600" />;
    if (lesson.video) return <Video className="w-4 h-4 text-blue-600" />;
    if (lesson.testEmbedCode) return <Target className="w-4 h-4 text-green-600" />;
    if (lesson.embedCode) return <FileText className="w-4 h-4 text-purple-600" />;
    return <BookOpen className="w-4 h-4 text-gray-600" />;
  };

  const getLessonTypeColor = (lesson: Lesson) => {
    if (!lesson) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (lesson.video) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (lesson.testEmbedCode) return 'bg-green-100 text-green-800 border-green-200';
    if (lesson.embedCode) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getLessonTypeLabel = (lesson: Lesson) => {
    if (!lesson) return 'Lesson';
    if (lesson.video) return 'Video';
    if (lesson.testEmbedCode) return 'Test';
    if (lesson.embedCode) return 'Content';
    return 'Lesson';
  };

  const filteredCourses = courses.filter(course => {
    if (!searchTerm.trim()) return true; // Show all courses if no search term
    
    const title = course.title || '';
    const description = course.description || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Course];
    let bValue: any = b[sortBy as keyof Course];
    
    // Handle undefined values
    if (aValue === undefined || aValue === null) aValue = '';
    if (bValue === undefined || bValue === null) bValue = '';
    
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      try {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } catch (error) {
        aValue = 0;
        bValue = 0;
      }
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Loading courses...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your platform's courses and lessons</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-2">
          <Plus className="w-4 h-4 inline-block dark:text-gray-600 text-white mr-2" />
          <span className="font-semibold">Create Course</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="flex gap-6">
        {/* <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{courses.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card> */}

        <Card className='w-1/4'>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {courses.filter(course => course.status === 'active').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='w-1/4'>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {courses.filter(course => course.status === 'inactive').length}
                </p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='w-1/4'>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Lessons</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {courses.reduce((total, course) => total + (course.lessons || []).length, 0)}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='w-1/4'>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Course Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₮{courseRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Actual revenue</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search courses or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
            
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt">Created Date</option>
                <option value="title">Title</option>
                <option value="price">Price</option>
                <option value="lessons">Lessons Count</option>
                <option value="status">Status</option>
              </select>
              
              <Button
                variant="outline"
                size="md"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-6 h-6" /> : <SortDesc className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Info */}
      <Card className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Course Status System</p>
              <p className="text-blue-700 dark:text-blue-300">
                <strong>Active courses</strong> are visible to students and can be enrolled in. 
                <strong> Inactive courses</strong> are hidden from students but retain all data and can be reactivated at any time. 
                Use the toggle switch to activate/deactivate courses instead of deletion to preserve course content and student progress.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {isBulkActionMode && (
        <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCourses.size === sortedCourses.length}
                    onChange={handleSelectAllCourses}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">
                    {selectedCourses.size} of {sortedCourses.length} courses selected
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('active')}
                  disabled={selectedCourses.size === 0}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Activate Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('inactive')}
                  disabled={selectedCourses.size === 0}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Deactivate Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCourses(new Set());
                    setIsBulkActionMode(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Action Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBulkActionMode(!isBulkActionMode)}
            className={isBulkActionMode ? 'bg-blue-100 text-blue-700' : ''}
          >
            {isBulkActionMode ? (
              <>
                <XCircle className="w-4 h-4 mr-2 inline-block" />
                Exit Bulk Mode
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2 inline-block" />
                Bulk Actions
              </>
            )}
          </Button>
          {isBulkActionMode && selectedCourses.size > 0 && (
            <span className="text-sm text-gray-600">
              {selectedCourses.size} course{selectedCourses.size > 1 ? 's' : ''} selected
            </span>
          )}
          {!isBulkActionMode && (
            <span className="text-sm text-gray-500">
              Press <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+B</kbd> for quick access
            </span>
          )}
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        {sortedCourses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">
              {statusFilter === 'inactive' ? 'No inactive courses' : 
               statusFilter === 'active' ? 'No active courses' : 'No courses found'}
            </h3>
            <p className="mb-4">
              {statusFilter === 'inactive' ? 'All courses are currently active' :
               statusFilter === 'active' ? 'All courses are currently inactive' :
               'Get started by creating your first course'}
            </p>
            {statusFilter === 'all' && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-2">
                <Plus className="w-4 h-4 inline-block mr-2" />
                Create First Course
              </Button>
            )}
          </div>
        ) : (
          sortedCourses.map((course, index) => (
            <Card key={course._id || `course-${index}`} className={`overflow-hidden transition-all duration-200 ${
              course.status === 'inactive' ? 'opacity-75 bg-gray-50 dark:bg-gray-800/50' : ''
            } ${
              isBulkActionMode && selectedCourses.has(course._id || '') 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : ''
            }`}>
              <CardHeader className={`${course.status === 'active' ? 'bg-gray-50 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {isBulkActionMode && (
                        <input
                          type="checkbox"
                          checked={selectedCourses.has(course._id || '')}
                          onChange={() => course._id && handleSelectCourse(course._id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      )}
                      <CardTitle className="text-xl">{course.title || 'Untitled Course'}</CardTitle>
                      <Badge 
                        variant={course.status === 'active' ? 'default' : 'secondary'}
                        className={course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {course.status === 'active' ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </Badge>
                    </div>
                    <CardDescription className="text-base">{course.description || 'No description available'}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="inline-flex items-center gap-2"
                      onClick={() => course._id && handleEditCourse(course)}
                    >
                      <Edit className="w-4 h-4 inline-block" />
                      <span className="font-semibold">Edit</span>
                    </Button>
                    
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800">
                      <span className="text-xs text-gray-600 dark:text-gray-400 mr-2">
                        {course.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                      <Switch
                        checked={course.status === 'active'}
                        onCheckedChange={(checked) => {
                          const newStatus = checked ? 'active' : 'inactive';
                          // Only update if status is actually changing
                          if (course._id && newStatus !== course.status) {
                            handleToggleCourseStatus(course._id, newStatus);
                          }
                        }}
                        disabled={updatingCourseStatus.has(course._id || '')}
                        className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-400 disabled:opacity-50"
                      />
                      {updatingCourseStatus.has(course._id || '') && (
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                      onClick={() => course._id && handleDeleteCourse(course._id)}
                    >
                      <Trash2 className="w-4 h-4 inline-block" />
                      <span className="font-semibold">Delete</span>
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-500" />
                    <span>{(course.lessons || []).length} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{(course.lessons || []).reduce((total, lesson) => total + (lesson.estimatedDuration || 0), 0)} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">₮{(course.price || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="mb-4">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    Course Lessons ({(course.lessons || []).length})
                  </h4>
                  
                  {(course.lessons || []).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No lessons added yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => course._id && handleEditCourse(course)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Lesson
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(course.lessons || []).map((lesson, index) => (
                        <div key={lesson._id || `lesson-${index}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getLessonTypeIcon(lesson)}
                              <Badge variant="outline" className={getLessonTypeColor(lesson)}>
                                {getLessonTypeLabel(lesson)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => course._id && handleEditLesson(course, lesson, index)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                onClick={() => course._id && handleDeleteLesson(course._id, index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">{lesson.title || 'Untitled Lesson'}</h5>
                          
                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <p className="line-clamp-2">{lesson.description || 'No description available'}</p>
                            {lesson.estimatedDuration && (
                              <div className="flex justify-between">
                                <span>Duration:</span>
                                <span className="font-medium">{lesson.estimatedDuration} min</span>
                              </div>
                            )}
                            {lesson.video && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <Video className="w-3 h-3" />
                                <span className="text-xs">Has Video</span>
                              </div>
                            )}
                            {lesson.testEmbedCode && (
                              <div className="flex items-center gap-1 text-green-600">
                                <Target className="w-3 h-3" />
                                <span className="text-xs">Has Test</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Created: {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Unknown'}</span>
                  <span>Updated: {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Unknown'}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          toast.success('Course created successfully!');
          fetchCourses(); // Refresh the courses list
        }}
      />

      {/* Edit Course Modal */}
      <EditCourseModal
        isOpen={isEditCourseModalOpen}
        onClose={() => {
          setIsEditCourseModalOpen(false);
          setSelectedCourse(null);
        }}
        onSuccess={() => {
          setIsEditCourseModalOpen(false);
          setSelectedCourse(null);
          toast.success('Course updated successfully!');
          fetchCourses(); // Refresh the courses list
        }}
        course={selectedCourse}
      />

      {/* Edit Lesson Modal */}
      <EditLessonModal
        isOpen={isEditLessonModalOpen}
        onClose={() => {
          setIsEditLessonModalOpen(false);
          setSelectedLesson(null);
          setSelectedCourse(null);
        }}
        onSuccess={() => {
          setIsEditLessonModalOpen(false);
          setSelectedLesson(null);
          setSelectedCourse(null);
          toast.success('Lesson updated successfully!');
          fetchCourses(); // Refresh the courses list
        }}
        lesson={selectedLesson}
        lessonIndex={selectedLessonIndex}
        courseId={selectedCourse?._id || ''}
      />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <AdminPageWrapper>
      <CoursesPageContent />
    </AdminPageWrapper>
  );
} 