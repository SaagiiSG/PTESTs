import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectMongoose } from '@/lib/mongodb';
import User from '@/app/models/user';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Analytics Payments API called');
    
    const session = await auth();
    console.log('📋 Session data:', {
      exists: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: (session.user as any).name,
        isAdmin: (session.user as any).isAdmin
      } : 'no user'
    });
    
    if (!session?.user?.email && !(session?.user as any)?.phoneNumber) {
      console.log('❌ No session or user email/phone found');
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }

    // Check if user is admin - try multiple authentication methods
    await connectMongoose();
    let user = null;
    
    if (session.user.email) {
      user = await User.findOne({ email: session.user.email });
    } else if ((session.user as any).phoneNumber) {
      user = await User.findOne({ phoneNumber: (session.user as any).phoneNumber });
    }
    
    // Fallback: try to find user by ID if we have it
    if (!user && session.user.id) {
      user = await User.findById(session.user.id);
    }
    
    console.log('👤 User lookup result:', {
      found: !!user,
      email: user?.email,
      phone: user?.phoneNumber,
      isAdmin: user?.isAdmin,
      name: user?.name,
      id: user?._id
    });
    
    if (!user?.isAdmin) {
      console.log('❌ User not found or not admin');
      return NextResponse.json({ 
        error: 'Forbidden - Not admin', 
        userFound: !!user,
        isAdmin: user?.isAdmin 
      }, { status: 403 });
    }

    console.log('✅ Admin user authenticated, proceeding with payment analytics...');

    // Get payments collection directly
    const paymentsCollection = mongoose.connection.db.collection('payments');
    
    // Get all payments
    const allPayments = await paymentsCollection.find({}).toArray();
    
    // Log the structure of first few payments to understand the data
    console.log('🔍 First 3 payment documents structure:', allPayments.slice(0, 3).map(p => ({
      _id: p._id,
      keys: Object.keys(p),
      object_id: p.object_id,
      payment_amount: p.payment_amount,
      payment_status: p.payment_status,
      payment_date: p.payment_date || p.createdAt,
      customerInfo: {
        customerName: p.customerName,
        customerEmail: p.customerEmail,
        userName: p.userName,
        userEmail: p.userEmail
      }
    })));
    
    // Get course and test collections for names
    const coursesCollection = mongoose.connection.db.collection('courses');
    const testsCollection = mongoose.connection.db.collection('tests');
    
    // Get all courses and tests for name lookup
    const allCourses = await coursesCollection.find({}).toArray();
    const allTests = await testsCollection.find({}).toArray();
    
    // Log what we found
    console.log('📚 Courses found:', allCourses.length, 'Sample:', allCourses.slice(0, 2).map(c => ({ _id: c._id, title: c.title })));
    console.log('📝 Tests found:', allTests.length, 'Sample:', allTests.slice(0, 2).map(t => ({ _id: t._id, title: t.title })));
    
    // Debug: Show actual payment object structure
    console.log('🔍 First payment object structure:', allPayments[0] ? {
      _id: allPayments[0]._id,
      keys: Object.keys(allPayments[0]),
      course: allPayments[0].course,
      test: allPayments[0].test,
      courseTitle: allPayments[0].courseTitle,
      testTitle: allPayments[0].testTitle,
      payment_amount: allPayments[0].payment_amount,
      payment_status: allPayments[0].payment_status
    } : 'No payments found');
    
    // Create lookup maps for faster access
    const courseMap = new Map(allCourses.map(c => [c._id.toString(), c.title]));
    const testMap = new Map(allTests.map(t => [t._id.toString(), t.title]));
    
    // Calculate monthly revenue
    const monthlyRevenue: { [key: string]: number } = {};
    let totalRevenue = 0;
    
    allPayments.forEach(payment => {
      // Use payment_amount field (the real field from your collection)
      const amount = payment.payment_amount || 0;
      const status = payment.payment_status;
      
      // Only count PAID payments
      if (status === 'PAID' && amount > 0) {
        totalRevenue += amount;
        
        // Group by month using payment_date
        const paymentDate = new Date(payment.payment_date || payment.createdAt);
        
        // Filter out invalid dates and only include recent months (2025+)
        if (paymentDate.getFullYear() >= 2025 && !isNaN(paymentDate.getTime())) {
          const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
          monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + amount;
        }
      }
    });
    
    // Get monthly user signups
    const usersCollection = mongoose.connection.db.collection('users');
    const allUsers = await usersCollection.find({ createdAt: { $exists: true } }).toArray();
    
    const monthlyUsers: { [key: string]: number } = {};
    allUsers.forEach(user => {
      const signupDate = new Date(user.createdAt);
      
      // Filter out invalid dates and only include recent months (2025+)
      if (signupDate.getFullYear() >= 2025 && !isNaN(signupDate.getTime())) {
        const monthKey = `${signupDate.getFullYear()}-${String(signupDate.getMonth() + 1).padStart(2, '0')}`;
        monthlyUsers[monthKey] = (monthlyUsers[monthKey] || 0) + 1;
      }
    });

    console.log('💰 Payment Analytics Results:', {
      totalPayments: allPayments.length,
      totalRevenue,
      monthlyRevenue,
      monthlyUsers,
      coursesFound: allCourses.length,
      testsFound: allTests.length
    });

    return NextResponse.json({
      totalPayments: allPayments.length,
      totalRevenue,
      monthlyRevenue,
      monthlyUsers,
      // Sample of recent payments for debugging
      recentPayments: allPayments
        .filter(p => p.payment_status === 'PAID' && p.payment_amount > 0)
        .sort((a, b) => new Date(b.payment_date || b.createdAt).getTime() - new Date(a.payment_date || a.createdAt).getTime())
        .slice(0, 3)
        .map(p => {
          // Get actual names from lookup maps using course field (ObjectId)
          const courseTitle = p.course ? courseMap.get(p.course.toString()) : null;
          const testTitle = p.test ? testMap.get(p.test.toString()) : null;
          
          console.log('🔍 Processing payment:', {
            paymentId: p._id,
            course: p.course,
            test: p.test,
            courseTitle,
            testTitle,
            originalData: {
              courseTitle: p.courseTitle,
              testTitle: p.testTitle,
              course: p.course,
              test: p.test
            }
          });
          
          return {
            _id: p._id,
            payment_amount: p.payment_amount,
            payment_status: p.payment_status,
            payment_date: p.payment_date || p.createdAt,
            courseTitle: courseTitle || p.courseTitle || p.course?.title || p.course,
            testTitle: testTitle || p.testTitle || p.test?.title || p.test,
            itemName: courseTitle || testTitle || p.itemName || p.description || 'Unknown Item',
            customerName: p.customerName || p.user?.name || p.userName || p.user,
            customerEmail: p.customerEmail || p.user?.email || p.userEmail,
            customerPhone: p.customerPhone || p.user?.phoneNumber || p.userPhone,
            createdAt: p.createdAt
          };
        })
    });

  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
