import React from 'react';
import { headers } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { auth } from '@/lib/auth';
import { IUser } from '@/app/models/user';
import { redirect } from 'next/navigation';
import { Users, BookOpen, GraduationCap, DollarSign, TrendingUp, Activity, Eye, ShoppingCart, Plus, ArrowRight, Calendar, Clock, UserCheck, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import AdminDashboardClient from './AdminDashboardClient';

async function getApiUrl(path: string) {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}${path}`;
}

async function fetchStats() {
  try {
    const [usersRes, coursesRes, testsRes, purchasesRes] = await Promise.all([
      fetch(await getApiUrl('/api/user'), { cache: 'no-store' }),
      fetch(await getApiUrl('/api/courses'), { cache: 'no-store' }),
      fetch(await getApiUrl('/api/tests'), { cache: 'no-store' }),
      fetch(await getApiUrl('/api/profile/purchase-history'), { cache: 'no-store' })
    ]);

    const users = usersRes.ok ? await usersRes.json() : [];
    const courses = coursesRes.ok ? await coursesRes.json() : [];
    const tests = testsRes.ok ? await testsRes.json() : [];
    const purchases = purchasesRes.ok ? await purchasesRes.json() : [];

    return {
      totalUsers: users.length,
      totalCourses: courses.length,
      totalTests: tests.length,
      totalRevenue: purchases.reduce((sum: number, purchase: any) => sum + (purchase.amount || 0), 0),
      recentPurchases: purchases.slice(0, 5),
      recentUsers: users.slice(-2).reverse(),
      recentCourses: courses.slice(-3).reverse(),
      recentTests: tests.slice(-3).reverse(),
      completeProfiles: users.filter((user: any) => 
        user.name && user.dateOfBirth && user.gender && user.education && user.family && user.position
      ).length,
      incompleteProfiles: users.filter((user: any) => 
        !(user.name && user.dateOfBirth && user.gender && user.education && user.family && user.position)
      ).length
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalUsers: 0,
      totalCourses: 0,
      totalTests: 0,
      totalRevenue: 0,
      recentPurchases: [],
      recentUsers: [],
      recentCourses: [],
      recentTests: [],
      completeProfiles: 0,
      incompleteProfiles: 0
    };
  }
}

export default async function AdminDashboard() {
  const session = await auth();
  const admin: IUser | undefined = session?.user as IUser | undefined;
  if (!admin?.isAdmin) {
    redirect('/home');
  }

  const stats = await fetchStats();

  return <AdminDashboardClient stats={stats} admin={admin} />;
}