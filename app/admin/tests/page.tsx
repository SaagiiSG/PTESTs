"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Eye, BookOpen, DollarSign, Users, BarChart3, MoreHorizontal, Star, Brain, Stethoscope, User } from 'lucide-react';
import CreateTestModal from '@/components/CreateTestModal';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import { fetchTests } from '@/lib/api';
import { toast } from 'sonner';
import TestCard from '@/components/testCard';
import { useLanguage } from '@/lib/language';
import { getLocalizedTitle } from '@/lib/utils';

function TestsPageContent() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeActions, setActiveActions] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTestType, setSelectedTestType] = useState<string>('all');
  const { language } = useLanguage();

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    try {
      const data = await fetchTests();
      setTests(data);
    } catch (error) {
      console.error('Error loading tests:', error);
      toast.error('Failed to load tests');
    }
    setLoading(false);
  };

  const handleCreateSuccess = () => {
    loadTests(); // Refresh the tests list
  };

  const handleViewTest = (testId: string) => {
    // Navigate to test view page
    window.open(`/ptests/${testId}`, '_blank');
    setActiveActions(null);
  };

  const handleEditTest = (testId: string) => {
    // Navigate to edit page or open edit modal
    toast.info('Edit functionality coming soon!');
    setActiveActions(null);
  };

  const handleDeleteTest = async (testId: string) => {
    if (confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/tests/${testId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          toast.success('Test deleted successfully!');
          loadTests(); // Refresh the list
        } else {
          toast.error('Failed to delete test');
        }
      } catch (error) {
        console.error('Error deleting test:', error);
        toast.error('Error deleting test');
      }
    }
    setActiveActions(null);
  };

  const toggleActions = (testId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Toggle actions clicked for test:', testId);
    console.log('Current activeActions:', activeActions);
    const newState = activeActions === testId ? null : testId;
    console.log('Setting activeActions to:', newState);
    setActiveActions(newState);
  };

  // Filter tests based on search and test type
  const filteredTests = tests.filter(test => {
    const localizedTitle = getLocalizedTitle(test.title, language);
    const matchesSearch = !searchTerm || 
      localizedTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description?.mn?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedTestType === 'all' || test.testType === selectedTestType;
    
    return matchesSearch && matchesType;
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Test Management</h1>
            <p className="text-gray-600 mt-1">Manage all tests on the platform</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Management</h1>
          <p className="text-gray-600 mt-1">Manage all tests on the platform</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <span className="flex flex-row items-center justify-center">
            <Plus className="w-4 h-4 mr-2" />
            Create Test
          </span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold">{tests.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Talent Tests</p>
                <p className="text-2xl font-bold">
                  {tests.filter((test: any) => test.testType === 'Talent').length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aptitude Tests</p>
                <p className="text-2xl font-bold">
                  {tests.filter((test: any) => test.testType === 'Aptitude').length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clinic & Personality</p>
                <p className="text-2xl font-bold">
                  {tests.filter((test: any) => test.testType === 'Clinic' || test.testType === 'Personality').length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className='py-6'>
        <CardHeader>
          <CardTitle>Tests</CardTitle>
          <CardDescription>Search and manage platform tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tests by title or description..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Test Type Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedTestType('all')}
              className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 flex items-center gap-2 font-medium ${
                selectedTestType === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              All Types
            </button>
            <button
              onClick={() => setSelectedTestType('Talent')}
              className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 flex items-center gap-2 font-medium ${
                selectedTestType === 'Talent'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              <Star className="w-4 h-4" />
              Talent
            </button>
            <button
              onClick={() => setSelectedTestType('Aptitude')}
              className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 flex items-center gap-2 font-medium ${
                selectedTestType === 'Aptitude'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-lg'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              <Brain className="w-4 h-4" />
              Aptitude
            </button>
            <button
              onClick={() => setSelectedTestType('Clinic')}
              className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 flex items-center gap-2 font-medium ${
                selectedTestType === 'Clinic'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500 shadow-lg'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Clinic
            </button>
            <button
              onClick={() => setSelectedTestType('Personality')}
              className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 flex items-center gap-2 font-medium ${
                selectedTestType === 'Personality'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500 shadow-lg'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              <User className="w-4 h-4" />
              Personality
            </button>
          </div>

          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test: any) => (
              <Card key={test._id} className="overflow-hidden group">
                <div className="relative h-48 bg-gray-200">
                  {test.thumbnailUrl ? (
                    <img
                      src={test.thumbnailUrl}
                      alt={test.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {/* Test Type Badge */}
                    {test.testType && (
                      <Badge 
                        className={`font-medium px-3 py-1.5 text-xs shadow-lg flex items-center gap-1.5 ${
                          test.testType === 'Talent' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                          test.testType === 'Aptitude' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' :
                          test.testType === 'Clinic' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' :
                          test.testType === 'Personality' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' :
                          'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                        }`}
                      >
                        {test.testType === 'Talent' && <Star className="w-3 h-3" />}
                        {test.testType === 'Aptitude' && <Brain className="w-3 h-3" />}
                        {test.testType === 'Clinic' && <Stethoscope className="w-3 h-3" />}
                        {test.testType === 'Personality' && <User className="w-3 h-3" />}
                        {test.testType}
                      </Badge>
                    )}
                    <Badge variant={test.isActive !== false ? "default" : "secondary"}>
                      {test.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{getLocalizedTitle(test.title, language)}</h3>
                    <div className="relative actions-container">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => toggleActions(test._id, e)}
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                      
                      {/* Debug indicator */}
                      {activeActions === test._id && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full z-50"></div>
                      )}
                      
                      {/* Actions Dropdown */}
                      {activeActions === test._id && (
                        <div className="absolute right-0 top-10 z-50 bg-white border rounded-lg shadow-xl py-1 min-w-[140px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewTest(test._id);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTest(test._id);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTest(test._id);
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
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {test.description?.en || test.description?.mn || 'No description available'}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{test.questions?.length || 0} questions</span>
                    <span className="font-semibold text-green-600">${test.price || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                    <span>{test.takenCount || 0} attempts</span>
                    <span className="text-blue-600">View Results</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTests.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">No tests found</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Test
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Test Modal */}
      <CreateTestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}

export default function TestsPage() {
  return (
    <AdminPageWrapper>
      <TestsPageContent />
    </AdminPageWrapper>
  );
} 