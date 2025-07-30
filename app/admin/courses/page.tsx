"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Eye, GraduationCap, DollarSign, Clock, MoreHorizontal } from 'lucide-react';
import CreateCourseModal from '@/components/CreateCourseModal';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import { fetchCourses } from '@/lib/api';
import { toast } from 'sonner';

function CoursesPageContent() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeActions, setActiveActions] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await fetchCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses');
    }
    setLoading(false);
  };

  const handleCreateSuccess = () => {
    loadCourses(); // Refresh the courses list
  };

  const handleViewCourse = (courseId: string) => {
    // Navigate to course view page
    window.open(`/Course/${courseId}`, '_blank');
    setActiveActions(null);
  };

  const handleEditCourse = (courseId: string) => {
    // Navigate to edit page or open edit modal
    toast.info('Edit functionality coming soon!');
    setActiveActions(null);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/courses/${courseId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          toast.success('Course deleted successfully!');
          loadCourses(); // Refresh the list
        } else {
          toast.error('Failed to delete course');
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Error deleting course');
      }
    }
    setActiveActions(null);
  };

  const toggleActions = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Toggle actions clicked for course:', courseId);
    console.log('Current activeActions:', activeActions);
    const newState = activeActions === courseId ? null : courseId;
    console.log('Setting activeActions to:', newState);
    setActiveActions(newState);
  };

  // Close actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log('Click outside detected');
      // Only close if we click outside of the actions button and dropdown
      const target = event.target as Element;
      if (!target.closest('.actions-container')) {
        console.log('Closing dropdown due to outside click');
        setActiveActions(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-600 mt-1">Manage all courses on the platform</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-1">Manage all courses on the platform</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                <p className="text-2xl font-bold">
                  {courses.reduce((sum: number, course: any) => sum + (course.lessons?.length || 0), 0)}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${courses.reduce((sum: number, course: any) => sum + (course.price || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold">
                  {courses.filter((course: any) => course.isActive !== false).length}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className='py-6'>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>Search and manage platform courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search courses by title or description..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
            {courses.map((course: any) => (
              <Card key={course._id} className="overflow-visible rounded-3xl group">
                <div className="relative h-48 bg-gray-200 rounded-3xl">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover rounded-3xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <GraduationCap className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={course.isActive !== false ? "default" : "secondary"}>
                      {course.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 overflow-visible">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
                    <div className="relative actions-container">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => toggleActions(course._id, e)}
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                      {/* Actions Dropdown */}
                      {activeActions === course._id && (
                        <div className="absolute right-0 top-10 z-100 bg-white border rounded-lg shadow-xl py-1 min-w-[140px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewCourse(course._id);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCourse(course._id);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCourse(course._id);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{course.lessons?.length || 0} lessons</span>
                    <span className="font-semibold text-green-600">${course.price || 0}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">No courses found</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Course
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
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