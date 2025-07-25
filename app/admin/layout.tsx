import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, BookOpen, GraduationCap, User, AppWindow } from 'lucide-react';
import logo from '@/public/PPNIM-logo-colered.svg';
import LogoutButton from '@/components/LogoutButton';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import AdminSidebarNav from '@/components/AdminSidebarNav';
import { redirect } from 'next/navigation';
import { IUser } from '@/app/models/user';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const admin: IUser | undefined = session?.user as IUser | undefined;
  if (!admin?.isAdmin) {
    redirect('/home');
  }
  return (
    <div className="min-h-screen flex">
      <aside className="fixed top-0 w-64 shadow-xl flex flex-col justify-between p-6 border-r min-h-screen h-screen rounded-r-3xl">
        <div>
          <Link href="/home" className="flex items-center gap-2 mb-6">
            <Image src={logo} alt="PPNIM Logo" width={100} height={50} className="cursor-pointer" />
          </Link>
          {/* Admin Info Card */}
          {admin && (
            <div className="mb-6 p-4 bg-gray-100 rounded-2xl shadow flex flex-col items-center text-center">
              <User className="w-10 h-10 text-gray-500 mb-2" />
              <div className="font-bold text-gray-800 text-lg">{admin.name || 'Admin'}</div>
              {admin.email && <div className="text-xs text-gray-600">{admin.email}</div>}
              {(admin as any)?.phoneNumber && <div className="text-xs text-gray-600">{(admin as any).phoneNumber}</div>}
              <div className="text-xs text-gray-500 font-semibold mt-1">Admin</div>
            </div>
          )}
          <AdminSidebarNav />
        </div>
        <div className="flex flex-col items-center">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-10 rounded-3xl shadow-xl ml-64">{children}</main>
    </div>
  );
} 