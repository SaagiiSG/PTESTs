'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, User } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import AdminSidebarNav from '@/components/AdminSidebarNav';
import { IUser } from '@/app/models/user';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  admin: IUser;
}

export default function AdminLayoutClient({ children, admin }: AdminLayoutClientProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      <aside className={`fixed top-0 transition-all duration-300 ease-in-out shadow-2xl flex flex-col justify-between p-6 border-r border-gray-200 min-h-screen h-screen bg-white rounded-r-3xl ${
        isSidebarCollapsed ? 'w-20' : 'w-72'
      }`}>
        <div>
          {/* Logo and Home Link */}
          <Link href="/home" className="flex items-center gap-3 mb-8 p-3 hover:bg-gray-50 rounded-2xl transition-colors duration-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Home className="w-4 h-4" />
              {!isSidebarCollapsed && <span className="font-medium">Back to Home</span>}
            </div>
          </Link>
          
          {/* Admin Info Card */}
          {admin && (
            <div className={`mb-6 p-4 bg-gray-100 rounded-2xl shadow flex flex-col items-center text-center ${
              isSidebarCollapsed ? 'px-2' : 'px-4'
            }`}>
              <User className="w-10 h-10 text-gray-500 mb-2" />
              {!isSidebarCollapsed && (
                <>
                  <div className="font-bold text-gray-800 text-lg">{admin.name || 'Admin'}</div>
                  {admin.email && <div className="text-xs text-gray-600">{admin.email}</div>}
                  {(admin as any)?.phoneNumber && <div className="text-xs text-gray-600">{(admin as any).phoneNumber}</div>}
                  <div className="text-xs text-gray-500 font-semibold mt-1">Admin</div>
                </>
              )}
            </div>
          )}
          <AdminSidebarNav isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        </div>
        <div className="flex flex-col items-center">
          <LogoutButton />
        </div>
      </aside>
      <main className={`flex-1 p-10 rounded-3xl shadow-xl transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'ml-20' : 'ml-72'
      }`}>
        {children}
      </main>
    </div>
  );
}
