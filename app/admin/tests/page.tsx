"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2, Eye, BookOpen, MoreHorizontal, Target, Brain, Stethoscope, User, ToggleLeft, ToggleRight, X, DollarSign } from 'lucide-react';
import CreateTestModal from '@/components/CreateTestModal';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import { toast } from 'sonner';
import Silk from '@/components/Silk/Silk';
import { 
  LineChart as MuiLineChart, 
  BarChart as MuiBarChart 
} from '@mui/x-charts';

function TestsPageContent() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [activeActions, setActiveActions] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: { en: '', mn: '' },
    description: { en: '', mn: '' },
    price: 0,
    testType: '',
    isActive: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [embedContent, setEmbedContent] = useState<string>('');
  const [loadingEmbed, setLoadingEmbed] = useState(false);

  // Update chart colors based on theme
  useEffect(() => {
    const updateChartColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const root = document.documentElement;
      
      if (isDark) {
        root.style.setProperty('--chart-text-color', '#E5E7EB');
        root.style.setProperty('--chart-border-color', '#374151');
      } else {
        root.style.setProperty('--chart-text-color', '#374151');
        root.style.setProperty('--chart-border-color', '#E5E7EB');
      }
    };

    // Initial update
    updateChartColors();

    // Watch for theme changes
    const observer = new MutationObserver(updateChartColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tests');
      if (response.ok) {
        const data = await response.json();
        setTests(data);
      }
    } catch (error) {
      console.error('Error loading tests:', error);
      toast.error('Failed to load tests');
    }
    setLoading(false);
  };

  const handleCreateSuccess = () => {
    loadTests(); // Refresh the tests list
  };

  const handleViewTest = async (test: any) => {
    setSelectedTest(test);
    setIsViewModalOpen(true);
    setActiveActions(null);
    setLoadingEmbed(true);
    try {
      const response = await fetch(`/api/tests/${test._id}/embed`);
      if (response.ok) {
        const data = await response.text();
        setEmbedContent(data);
      } else {
        toast.error('Failed to load test embed content');
      }
    } catch (error) {
      console.error('Error loading test embed content:', error);
      toast.error('Failed to load test embed content');
    } finally {
      setLoadingEmbed(false);
    }
  };

  const handleEditTest = (test: any) => {
    setSelectedTest(test);
    setEditForm({
      title: { en: test.title?.en || '', mn: test.title?.mn || '' },
      description: { en: test.description?.en || '', mn: test.description?.mn || '' },
      price: test.price || 0,
      testType: test.testType || '',
      isActive: test.isActive !== false
    });
    setIsEditModalOpen(true);
    setActiveActions(null);
  };

  const handleUpdateTest = async () => {
    if (!selectedTest) return;
    
    try {
      const response = await fetch(`/api/tests/${selectedTest._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });
      
      if (response.ok) {
        toast.success('Test updated successfully!');
        setIsEditModalOpen(false);
        setSelectedTest(null);
        loadTests(); // Refresh the list
      } else {
        toast.error('Failed to update test');
      }
    } catch (error) {
      console.error('Error updating test:', error);
      toast.error('Error updating test');
    }
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

  const handleToggleTestStatus = async (testId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus
        }),
      });
      
      if (response.ok) {
        toast.success(`Test ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        loadTests(); // Refresh the tests list
      } else {
        toast.error('Failed to update test status');
      }
    } catch (error) {
      console.error('Error updating test status:', error);
      toast.error('Error updating test status');
    }
    setActiveActions(null);
  };

  const toggleActions = (testId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = activeActions === testId ? null : testId;
    setActiveActions(newState);
  };

  // Close actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.actions-container')) {
        setActiveActions(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Calculate stats for each test type
  const getTestTypeStats = (testType: string) => {
    const typeTests = tests.filter(test => test.testType === testType);
    const activeTests = typeTests.filter(test => test.isActive !== false);
    const totalRevenue = typeTests.reduce((sum, test) => sum + (test.price || 0), 0);
    const totalAttempts = typeTests.reduce((sum, test) => sum + (test.takenCount || 0), 0);
    
    return {
      count: typeTests.length,
      activeCount: activeTests.length,
      totalRevenue,
      totalAttempts
    };
  };

  const talentStats = getTestTypeStats('Talent');
  const aptitudeStats = getTestTypeStats('Aptitude');
  const clinicStats = getTestTypeStats('Clinic');
  const personalityStats = getTestTypeStats('Personality');

  // Filter tests based on search term
  const filteredTests = tests.filter(test => {
    const searchLower = searchTerm.toLowerCase();
    return (
      test.title?.en?.toLowerCase().includes(searchLower) ||
      test.title?.mn?.toLowerCase().includes(searchLower) ||
      test.description?.en?.toLowerCase().includes(searchLower) ||
      test.description?.mn?.toLowerCase().includes(searchLower) ||
      test.testType?.toLowerCase().includes(searchLower)
    );
  });

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2 inline-block" />
          Create Test
        </Button>
      </div>

      {/* Test Type Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Talent Tests */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Target className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Talent Tests</p>
                <p className="text-2xl font-bold text-blue-600">{talentStats.count}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Active: {talentStats.activeCount}</span>
              <span className="font-medium text-green-600">₮{talentStats.totalRevenue.toFixed(0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Aptitude Tests */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Brain className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Aptitude Tests</p>
                <p className="text-2xl font-bold text-emerald-600">{aptitudeStats.count}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Active: {aptitudeStats.activeCount}</span>
              <span className="font-medium text-green-600">₮{aptitudeStats.totalRevenue.toFixed(0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Clinic Tests */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Stethoscope className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Clinic Tests</p>
                <p className="text-2xl font-bold text-purple-600">{clinicStats.count}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Active: {clinicStats.activeCount}</span>
              <span className="font-medium text-green-600">₮{clinicStats.totalRevenue.toFixed(0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Personality Tests */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <User className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Personality Tests</p>
                <p className="text-2xl font-bold text-orange-600">{personalityStats.count}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Active: {personalityStats.activeCount}</span>
              <span className="font-medium text-green-600">₮{personalityStats.totalRevenue.toFixed(0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className='w-full py-6'>
        <CardHeader>
          <CardTitle>Tests</CardTitle>
          <CardDescription>Search and manage platform tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tests by title, description, or type..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test: any) => (
              <Card key={test._id} className="overflow-hidden group hover:shadow-md transition-all duration-200">
                <div className="relative h-48 bg-gray-200">
                  {test.thumbnailUrl ? (
                    <img
                      src={test.thumbnailUrl}
                      alt={test.title?.en || test.title?.mn || 'Test'}
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
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {test.title?.en || test.title?.mn || 'Untitled Test'}
                    </h3>
                    <div className="relative actions-container">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => toggleActions(test._id, e)}
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                      
                      {/* Actions Dropdown */}
                      {activeActions === test._id && (
                        <div className="absolute right-0 top-10 z-50 bg-white border rounded-lg shadow-lg py-1 min-w-[160px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewTest(test);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTest(test);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTestStatus(test._id, test.isActive !== false);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                              test.isActive !== false ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
                            }`}
                          >
                            {test.isActive !== false ? (
                              <>
                                <ToggleLeft className="w-4 h-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleRight className="w-4 h-4" />
                                Activate
                              </>
                            )}
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
                    <span className="font-semibold text-green-600">₮{test.price || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                    <span>{test.takenCount || 0} attempts</span>
                    <span className={`font-medium ${test.isActive !== false ? 'text-green-600' : 'text-red-600'}`}>
                      {test.isActive !== false ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredTests.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">No tests found</p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Test
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Graphic */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Revenue Trends by Test Type
          </CardTitle>
          <CardDescription>Monthly revenue performance across different test categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <MuiBarChart
              width={800}
              height={300}
              series={[
                {
                  data: [talentStats.totalRevenue, aptitudeStats.totalRevenue, clinicStats.totalRevenue, personalityStats.totalRevenue],
                  label: 'Total Revenue (₮)',
                  color: '#10B981'
                }
              ]}
              xAxis={[
                {
                  data: ['Talent', 'Aptitude', 'Clinic', 'Personality'],
                  scaleType: 'band',
                  tickLabelStyle: {
                    fill: 'var(--chart-text-color, #374151)',
                    fontSize: 12
                  }
                }
              ]}
              yAxis={[
                {
                  tickLabelStyle: {
                    fill: 'var(--chart-text-color, #374151)',
                    fontSize: 12
                  }
                }
              ]}
              margin={{ left: 60, right: 40, top: 20, bottom: 60 }}
              sx={{
                '--chart-text-color': 'var(--chart-text-color, #374151)',
                '& .MuiChartsAxis-line': {
                  stroke: 'var(--chart-border-color, #E5E7EB)'
                },
                '& .MuiChartsAxis-tick': {
                  stroke: 'var(--chart-border-color, #E5E7EB)'
                },
                '& .MuiChartsAxis-label': {
                  fill: 'var(--chart-text-color, #374151)'
                }
              }}
            />
          </div>
          
          {/* Revenue Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-600">Talent Tests</p>
              <p className="text-xl font-bold text-blue-800">₮{talentStats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-blue-600">{talentStats.count} tests</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm font-medium text-emerald-600">Aptitude Tests</p>
              <p className="text-xl font-bold text-emerald-800">₮{aptitudeStats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-emerald-600">{aptitudeStats.count} tests</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-600">Clinic Tests</p>
              <p className="text-xl font-bold text-purple-800">₮{clinicStats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-purple-600">{clinicStats.count} tests</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-orange-600">Personality Tests</p>
              <p className="text-xl font-bold text-orange-800">₮{personalityStats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-orange-600">{personalityStats.count} tests</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Test Modal */}
      <CreateTestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Test Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-[100vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Test</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title (English)</label>
                <Input
                  value={editForm.title.en}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: { ...prev.title, en: e.target.value } }))}
                  placeholder="Test title in English"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Title (Mongolian)</label>
                <Input
                  value={editForm.title.mn}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: { ...prev.title, mn: e.target.value } }))}
                  placeholder="Test title in Mongolian"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Description (English)</label>
                <textarea
                  value={editForm.description.en}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: { ...prev.description, en: e.target.value } }))}
                  placeholder="Test description in English"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description (Mongolian)</label>
                <textarea
                  value={editForm.description.mn}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: { ...prev.description, mn: e.target.value } }))}
                  placeholder="Test description in Mongolian"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Price (₮)</label>
                <Input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Test Type</label>
                <select
                  value={editForm.testType}
                  onChange={(e) => setEditForm(prev => ({ ...prev, testType: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type</option>
                  <option value="Talent">Talent</option>
                  <option value="Aptitude">Aptitude</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Personality">Personality</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={editForm.isActive}
                onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Test is active and available to users
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTest}>
                Update Test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Test Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 scale-75">
          <div className="relative w-[98vw] h-[98vh] bg-white rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-3xl flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Test Preview</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedTest?.title?.en || selectedTest?.title?.mn || 'Untitled Test'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsViewModalOpen(false)}
                className="h-10 w-10 p-0 hover:bg-gray-200 rounded-full transition-all duration-200 hover:scale-105"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 bg-white overflow-scroll">
              {selectedTest && (
                <div className="w-full h-full">
                  {loadingEmbed ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="relative mb-6">
                          <div className="w-20 h-20 border-4 border-gray-200 rounded-full animate-spin mx-auto"></div>
                          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                        </div>
                        <p className="text-xl font-semibold text-gray-900 mb-2">Loading test preview...</p>
                        <p className="text-sm text-gray-600">Please wait while we prepare your test</p>
                        <div className="mt-4 flex justify-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="w-full h-full embed-container"
                      style={{
                        width: '100%',
                        height: '210%',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'stretch',
                        overflow: 'auto'
                      }}
                    >
                      <div 
                        dangerouslySetInnerHTML={{ __html: embedContent }}
                        className="w-full embed-content"
                        style={{
                          width: '100%',
                          flex: '1',
                          display: 'block',
                          minHeight: '100%',
                          overflow: 'visible'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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