"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, Users, UserCheck, Crown, UserPlus, Eye, Edit, Trash2, Mail } from 'lucide-react';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import { fetchUsers } from '@/lib/api';
import { toast } from 'sonner';

function UsersPageContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeActions, setActiveActions] = useState<string | null>(null);

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
    toast.info('Edit functionality coming soon!');
    setActiveActions(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/user/${userId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          toast.success('User deleted successfully!');
          loadUsers(); // Refresh the list
        } else {
          toast.error('Failed to delete user');
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
    console.log('Toggle actions clicked for user:', userId);
    console.log('Current activeActions:', activeActions);
    const newState = activeActions === userId ? null : userId;
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

  const getStatusBadge = (user: any) => {
    if (user.isAdmin) {
      return <Badge variant="destructive">Admin</Badge>;
    } else if (user.isPremium) {
      return <Badge variant="default">Premium</Badge>;
    } else {
      return <Badge variant="secondary">User</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all users on the platform</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all users on the platform</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">
                  {users.filter((user: any) => user.isActive !== false).length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Premium Users</p>
                <p className="text-2xl font-bold">
                  {users.filter((user: any) => user.isPremium).length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card> */}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
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

      {/* Search and Users Table */}
      <Card className='py-6'>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Search and manage platform users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users by name or email..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Joined</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name || user.email}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(user)}
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
                        
                        {/* Debug indicator */}
                        {activeActions === user._id && (
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full z-50"></div>
                        )}
                        
                        {/* Actions Dropdown */}
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
                              Send Email
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(user._id);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
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

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No users found</p>
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