"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, Users, UserCheck, Crown, UserPlus, Eye, Edit, Trash2, Mail, Calendar, GraduationCap, Users as FamilyIcon, Briefcase, Phone, Clock, Shield } from 'lucide-react';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import { fetchUsers } from '@/lib/api';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/language';

function UsersPageContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeActions, setActiveActions] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const { t } = useLanguage();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
    setLoading(false);
  };

  const handleViewUser = (userId: string) => {
    // Navigate to user profile page
    window.open(`/user/${userId}`, '_blank');
    setActiveActions(null);
  };

  const handleEditUser = (userId: string) => {
    // Navigate to edit page or open edit modal
    toast.info(t('editComingSoon'));
    setActiveActions(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/user/${userId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          toast.success(t('userDeleted'));
          loadUsers(); // Refresh the list
        } else {
          toast.error(t('failedToDelete'));
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Error deleting user');
      }
    }
    setActiveActions(null);
  };

  const handleSendEmail = (userEmail: string) => {
    // Open email client or show email modal
    window.open(`mailto:${userEmail}`, '_blank');
    setActiveActions(null);
  };

  const toggleActions = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = activeActions === userId ? null : userId;
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

  const getStatusBadge = (user: any) => {
    if (user.isAdmin) {
      return <Badge variant="destructive" className="flex items-center gap-1"><Shield className="w-3 h-3" />{t('admin')}</Badge>;
    } else {
      return <Badge variant="secondary">{t('users')}</Badge>;
    }
  };

  const getProfileCompletionBadge = (user: any) => {
    const hasRequiredFields = user.name && user.dateOfBirth && user.gender && user.education && user.family && user.position;
    if (hasRequiredFields) {
      return <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1"><UserCheck className="w-3 h-3" />{t('complete')}</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{t('incomplete')}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateOfBirth = (dateString: string) => {
    if (!dateString) return t('notSet');
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredUsers = users.filter((user: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.education?.toLowerCase().includes(searchLower) ||
      user.position?.toLowerCase().includes(searchLower) ||
      user.gender?.toLowerCase().includes(searchLower) ||
      user.family?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('userManagement')}</h1>
            <p className="text-gray-600 mt-1">{t('manageAllUsers')}</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('userManagement')}</h1>
          <p className="text-gray-600 mt-1">{t('manageAllUsers')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('totalUsers')}</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('completeProfiles')}</p>
                <p className="text-2xl font-bold">
                  {users.filter((user: any) => 
                    user.name && user.dateOfBirth && user.gender && user.education && user.family && user.position
                  ).length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('adminUsers')}</p>
                <p className="text-2xl font-bold">
                  {users.filter((user: any) => user.isAdmin).length}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <Crown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('newThisMonth')}</p>
                <p className="text-2xl font-bold">
                  {users.filter((user: any) => {
                    const userDate = new Date(user.createdAt);
                    const now = new Date();
                    return userDate.getMonth() === now.getMonth() && 
                           userDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and View Toggle */}
      <Card className='py-6'>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('users')}</CardTitle>
              <CardDescription>{t('manageAllUsers')}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                {t('cards')}
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                {t('table')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t('searchUsers')}
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Cards View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user: any) => (
                <Card key={user._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* User Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{user.name || 'Unnamed User'}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="relative actions-container">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => toggleActions(user._id, e)}
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                        
                        {activeActions === user._id && (
                          <div className="absolute right-0 top-10 z-50 bg-white border rounded-lg shadow-xl py-1 min-w-[160px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendEmail(user.email);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Mail className="w-4 h-4" />
                              {t('sendEmail')}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(user._id);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              {t('deleteUser')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex gap-2 mb-4">
                      {getStatusBadge(user)}
                      {getProfileCompletionBadge(user)}
                    </div>

                    {/* Profile Information */}
                    <div className="space-y-3 mb-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{t('age')}:</span>
                          <span className="font-medium">
                            {calculateAge(user.dateOfBirth) || t('unknown')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{t('gender')}:</span>
                          <span className="font-medium">{user.gender || t('notSet')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{t('education')}:</span>
                        <span className="font-medium">{user.education || t('notSet')}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FamilyIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{t('family')}:</span>
                        <span className="font-medium">{user.family || t('notSet')}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{t('position')}:</span>
                        <span className="font-medium">{user.position || t('notSet')}</span>
                      </div>
                    </div>

                    {/* Contact & Verification */}
                    <div className="space-y-2 mb-4">
                      {user.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{user.phoneNumber}</span>
                          {user.isPhoneVerified && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">{t('verified')}</Badge>
                          )}
                        </div>
                      )}
                      
                      {user.isEmailVerified && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">{t('emailVerified')}</span>
                        </div>
                      )}
                    </div>

                    {/* Account Info */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{t('joined')} {formatDate(user.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{t('updated')} {formatDate(user.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">{t('users')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">{t('profileCompletion')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">{t('education')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">{t('joined')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: any) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name || 'Unnamed User'}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getProfileCompletionBadge(user)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p className="font-medium">{user.education || t('notSet')}</p>
                          <p className="text-gray-500">{user.position || t('notSet')}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="relative actions-container">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => toggleActions(user._id, e)}
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                          
                          {activeActions === user._id && (
                            <div className="absolute right-0 top-10 z-50 bg-white border rounded-lg shadow-xl py-1 min-w-[160px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendEmail(user.email);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Mail className="w-4 h-4" />
                                {t('sendEmail')}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteUser(user._id);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                {t('deleteUser')}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">
                {searchTerm ? t('noUsersMatchingSearch') : t('noUsersYet')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function UsersPage() {
  return (
    <AdminPageWrapper>
      <UsersPageContent />
    </AdminPageWrapper>
  );
} 