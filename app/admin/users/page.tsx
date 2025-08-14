"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, MoreHorizontal, Users, UserCheck, Crown, UserPlus, Eye, Edit, Trash2, Mail, 
  Calendar, GraduationCap, Users as FamilyIcon, Briefcase, Phone, Clock, Shield, 
  Filter, Download, RefreshCw, Star, Award, TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react';
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
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete' | 'admin'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt' | 'lastActive'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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
    window.open(`/user/${userId}`, '_blank');
    setActiveActions(null);
  };

  const handleEditUser = (userId: string) => {
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
          loadUsers();
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
    window.open(`mailto:${userEmail}`, '_blank');
    setActiveActions(null);
  };

  const toggleActions = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = activeActions === userId ? null : userId;
    setActiveActions(newState);
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/user/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAdmin: !currentStatus }),
      });
      
      if (response.ok) {
        toast.success(`User ${!currentStatus ? 'promoted to' : 'removed from'} admin`);
        loadUsers();
      } else {
        toast.error('Failed to update admin status');
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error('Error updating admin status');
    }
    setActiveActions(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.actions-container')) {
        setActiveActions(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', MouseEvent);
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
      return <Badge variant="default" className="bg-green-100 text-green-800 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" />{t('complete')}</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{t('incomplete')}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getProfileCompletionPercentage = (user: any) => {
    const fields = ['name', 'dateOfBirth', 'gender', 'education', 'family', 'position', 'phoneNumber'];
    const completedFields = fields.filter(field => user[field]).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === 'complete') {
      matchesFilter = user.name && user.dateOfBirth && user.gender && user.education && user.family && user.position;
    } else if (filterStatus === 'incomplete') {
      matchesFilter = !(user.name && user.dateOfBirth && user.gender && user.education && user.family && user.position);
    } else if (filterStatus === 'admin') {
      matchesFilter = user.isAdmin;
    }
    
    return matchesSearch && matchesFilter;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'createdAt' || sortBy === 'lastActive') {
      aValue = new Date(aValue || 0).getTime();
      bValue = new Date(bValue || 0).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Age', 'Gender', 'Education', 'Position', 'Profile Complete', 'Admin', 'Created At'],
      ...sortedUsers.map(user => [
        user.name || 'N/A',
        user.email || 'N/A',
        user.phoneNumber || 'N/A',
        calculateAge(user.dateOfBirth) || 'N/A',
        user.gender || 'N/A',
        user.education || 'N/A',
        user.position || 'N/A',
        getProfileCompletionPercentage(user) + '%',
        user.isAdmin ? 'Yes' : 'No',
        formatDate(user.createdAt)
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminPageWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('userManagement')}</h1>
            <p className="text-gray-600 mt-1">Manage user accounts and profiles</p>
          </div>
          <div className="flex items-center gap-3">
            {/* <Button variant="outline" onClick={exportUsers}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button> */}
            <Button variant="outline" onClick={loadUsers}>
              <RefreshCw className="w-4 h-4 mr-2 inline-block" />
              Refresh
            </Button>
            {/* <Button>
              <UserPlus className="w-4 h-4 mr-2 inline-block" />
              Add User
            </Button> */}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
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
                  <p className="text-sm font-medium text-gray-600">Complete Profiles</p>
                  <p className="text-2xl font-bold">
                    {users.filter(user => user.name && user.dateOfBirth && user.gender && user.education && user.family && user.position).length}
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
                  <p className="text-sm font-medium text-gray-600">Admin Users</p>
                  <p className="text-2xl font-bold">{users.filter(user => user.isAdmin).length}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold">
                    {users.filter(user => {
                      const userDate = new Date(user.createdAt);
                      const monthAgo = new Date();
                      monthAgo.setMonth(monthAgo.getMonth() - 1);
                      return userDate > monthAgo;
                    }).length}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="complete">Complete Profiles</option>
                  <option value="incomplete">Incomplete Profiles</option>
                  <option value="admin">Admin Users</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="lastActive">Last Active</option>
                </select>
                
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className='w-10 h-10'
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
                
                <div className="flex border border-gray-300 rounded-md">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                    size="default"
                    onClick={() => setViewMode('cards')}
                    className="rounded-r-none"
                  >
                    <div className="grid grid-cols-2 gap-1 w-4 h-4">
                      <div className="w-1 h-1 bg-current rounded-sm"></div>
                      <div className="w-1 h-1 bg-current rounded-sm"></div>
                      <div className="w-1 h-1 bg-current rounded-sm"></div>
                      <div className="w-1 h-1 bg-current rounded-sm"></div>
                    </div>
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="default"
                    onClick={() => setViewMode('table')}
                    className="rounded-l-none"
                  >
                    <div className="grid grid-cols-1 gap-1 w-4 h-4">
                      <div className="w-full h-1 bg-current rounded-sm"></div>
                      <div className="w-full h-1 bg-current rounded-sm"></div>
                      <div className="w-full h-1 bg-current rounded-sm"></div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Display */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedUsers.map((user) => (
              <Card key={user._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex flex-col h-full">
                  {/* User Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.name || t('unnamedUser')}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
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
                          {/* <button
                            onClick={() => handleViewUser(user._id)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Profile
                          </button>
                          <button
                            onClick={() => handleEditUser(user._id)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit User
                          </button>
                          <button
                            onClick={() => handleSendEmail(user.email)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Mail className="w-4 h-4" />
                            Send Email
                          </button>
                          <button
                            onClick={() => toggleAdminStatus(user._id, user.isAdmin)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            {user.isAdmin ? <Users className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                            {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                          </button> */}
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete User
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Completion */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Profile Completion</span>
                      <span className="text-sm font-medium">{getProfileCompletionPercentage(user)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProfileCompletionPercentage(user)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    {getStatusBadge(user)}
                    {getProfileCompletionBadge(user)}
                  </div>

                  {/* Profile Information */}
                  <div className="space-y-3 text-xs mb-4 flex-grow">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">{t('age')}:</span>
                      <span className="font-medium">
                        {calculateAge(user.dateOfBirth) || t('unknown')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">{t('gender')}:</span>
                      <span className="font-medium">{user.gender || t('notSet')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">{t('education')}:</span>
                      <span className="font-medium">{user.education || t('notSet')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">{t('position')}:</span>
                      <span className="font-medium">{user.position || t('notSet')}</span>
                    </div>
                    {user.family && (
                      <div className="flex items-center gap-2">
                        <FamilyIcon className="w-3 h-3 text-gray-400 inline-block" />
                        <span className="text-gray-600">{t('family')}:</span>
                        <span className="font-medium">{user.family}</span>
                      </div>
                    )}
                    {user.dateOfBirth && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-gray-400 inline-block" />
                        <span className="text-gray-600">{t('birthDate')}:</span>
                        <span className="font-medium">{formatDateOfBirth(user.dateOfBirth)}</span>
                      </div>
                    )}
                  </div>

                  {/* Contact & Status - Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-auto">
                    <div className="flex items-center gap-4 text-xs">
                      {user.phoneNumber && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400 inline-block" />
                          <span className="text-gray-600">{user.phoneNumber}</span>
                        </div>
                      )}
                      {user.isEmailVerified && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-green-500 inline-block" />
                          <span className="text-green-600">{t('verified')}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium">User</th>
                      <th className="text-left py-3 px-4 font-medium">Profile</th>
                      <th className="text-left py-3 px-4 font-medium">Contact</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Created</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.map((user) => (
                      <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-blue-600 inline-block" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{user.name || t('unnamedUser')}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{getProfileCompletionPercentage(user)}%</span>
                            {getProfileCompletionBadge(user)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            {user.phoneNumber && (
                              <div className="flex items-center gap-1 mb-1">
                                <Phone className="w-3 h-3 text-gray-400 inline-block" />
                                <span>{user.phoneNumber}</span>
                              </div>
                            )}
                            {user.isEmailVerified && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-green-500 inline-block" />
                                <span className="text-green-600">Verified</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(user)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="relative actions-container">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => toggleActions(user._id, e)}
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="w-4 h-4 inline-block" />
                            </Button>
                            
                            {activeActions === user._id && (
                              <div className="absolute right-0 top-10 z-50 bg-white border rounded-lg shadow-xl py-1 min-w-[160px]">
                                {/* <button
                                  onClick={() => handleViewUser(user._id)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Profile
                                </button> */}
                                {/* <button
                                  onClick={() => handleEditUser(user._id)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit User
                                </button> */}
                                {/* <button
                                  onClick={() => handleSendEmail(user.email)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Mail className="w-4 h-4" />
                                  Send Email
                                </button> */}
                                {/* <button
                                  onClick={() => toggleAdminStatus(user._id, user.isAdmin)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  {user.isAdmin ? <Users className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                  {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                </button> */}
                                <button
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4 inline-block" />
                                  Delete User
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
            </CardContent>
          </Card>
        )}

        {sortedUsers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminPageWrapper>
  );
}

export default function UsersPage() {
  return <UsersPageContent />;
} 