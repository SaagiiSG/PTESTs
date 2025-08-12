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
import { connectMongoose } from '@/lib/mongodb';
import User from '@/app/models/user';
import Course from '@/app/models/course';
import Purchase from '@/app/models/purchase';

async function getApiUrl(path: string) {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}${path}`;
}

async function fetchStats() {
  try {
    await connectMongoose();
    
    // Fetch real data from database
    const [users, courses, purchases] = await Promise.all([
      User.find({}).sort({ createdAt: -1 }).limit(5),
      Course.find({}).sort({ createdAt: -1 }).limit(3),
      Purchase.find({ status: 'completed' }).sort({ createdAt: -1 }).limit(5)
    ]);

    // Calculate real statistics
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalTests = 0; // TODO: Add Test model if needed
    const totalRevenue = purchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0);
    
    // Calculate profile completion stats
    const completeProfiles = await User.countDocuments({
      name: { $exists: true, $ne: '' },
      dateOfBirth: { $exists: true },
      gender: { $exists: true, $ne: '' },
      education: { $exists: true, $ne: '' },
      family: { $exists: true, $ne: '' },
      position: { $exists: true, $ne: '' }
    });
    
    const incompleteProfiles = totalUsers - completeProfiles;

    // Get recent users with populated data - serialize MongoDB objects
    const recentUsers = users.map(user => {
      const userObj = JSON.parse(JSON.stringify(user));
      return {
        _id: userObj._id,
        name: userObj.name,
        email: userObj.email,
        phoneNumber: userObj.phoneNumber,
        dateOfBirth: userObj.dateOfBirth,
        gender: userObj.gender,
        education: userObj.education,
        family: userObj.family,
        position: userObj.position,
        createdAt: userObj.createdAt
      };
    });

    // Get recent courses - serialize MongoDB objects
    const recentCourses = courses.map(course => {
      const courseObj = JSON.parse(JSON.stringify(course));
      return {
        _id: courseObj._id,
        title: courseObj.title,
        lessons: courseObj.lessons,
        price: courseObj.price,
        createdAt: courseObj.createdAt
      };
    });

    // Get recent purchases with user and course info - serialize MongoDB objects
    const recentPurchases = purchases.map(purchase => {
      const purchaseObj = JSON.parse(JSON.stringify(purchase));
      return {
        _id: purchaseObj._id,
        amount: purchaseObj.amount,
        status: purchaseObj.status,
        createdAt: purchaseObj.createdAt,
        courseTitle: purchaseObj.courseTitle || 'Unknown Course',
        userName: purchaseObj.userName || 'Unknown User',
        userEmail: purchaseObj.userEmail || 'No Email'
      };
    });

    return {
      totalUsers,
      totalCourses,
      totalTests,
      totalRevenue,
      recentPurchases,
      recentUsers,
      recentCourses,
      recentTests: [], // TODO: Add when Test model is implemented
      completeProfiles,
      incompleteProfiles
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

  // Serialize admin data to remove any MongoDB-specific properties
  const serializedAdmin = JSON.parse(JSON.stringify(admin));

  return <AdminDashboardClient stats={stats} admin={serializedAdmin} />;
}