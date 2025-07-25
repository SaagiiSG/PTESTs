'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ChangePassword = ({ onChangePassword }) => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmNewPassword) {
      setError('New passwords do not match.');
      setSuccess('');
      return;
    }
    try {
      await onChangePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password changed!');
      setError('');
      setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setError('Failed to change password.');
      setSuccess('');
    }
  };

  return (
    <div className="flex items-center justify-center h-full w-full">
      <form onSubmit={handleSubmit} className="w-full h-full p-8 bg-white rounded-3xl shadow space-y-6 flex flex-col justify-center">
        <h2 className="text-2xl font-semibold mb-4 text-center">Change Password</h2>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Current Password</label>
          <Input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} placeholder="Current password" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">New Password</label>
          <Input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="New password" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Confirm New Password</label>
          <Input type="password" name="confirmNewPassword" value={form.confirmNewPassword} onChange={handleChange} placeholder="Confirm new password" />
        </div>
        <Button type="submit" className="w-full mt-4">Change Password</Button>
        {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        {success && <div className="text-green-600 text-center mt-2">{success}</div>}
      </form>
    </div>
  );
};

export default ChangePassword;