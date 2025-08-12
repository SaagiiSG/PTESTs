import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, BookOpen, GraduationCap, User, AppWindow, LogOut } from 'lucide-react';
// import Logo from '@/public/PPNIM-logo-colored.svg';
import LogoutButton from '@/components/LogoutButton';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import AdminSidebarNav from '@/components/AdminSidebarNav';
import { redirect } from 'next/navigation';
import { IUser } from '@/app/models/user';
import { connectMongoose } from '@/lib/mongodb';
import UserModel from '@/app/models/user';
import AdminLayoutClient from './AdminLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session?.user?.id) {
    console.log('Admin layout: No session or user ID');
    redirect('/login');
  }

  // CRITICAL SECURITY: Double-check admin status against database
  try {
    await connectMongoose();
    const dbUser = await UserModel.findById(session.user.id);
    
    if (!dbUser) {
      console.log('Admin layout: User not found in database');
      redirect('/login');
    }
    
    if (!dbUser.isAdmin) {
      console.log('Admin layout: User is not admin:', { userId: session.user.id, isAdmin: dbUser.isAdmin });
      redirect('/home');
    }
    
    console.log('Admin layout: Admin access granted for:', { userId: dbUser._id, name: dbUser.name, isAdmin: dbUser.isAdmin });
    
    // Use the database user data, not session data - serialize MongoDB object
    const admin: IUser = JSON.parse(JSON.stringify(dbUser));
    
    return <AdminLayoutClient admin={admin}>{children}</AdminLayoutClient>;
  } catch (error) {
    console.error('Admin layout: Database error:', error);
    redirect('/login');
  }
} 