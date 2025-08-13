import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectMongoose } from '@/lib/mongodb';
import UserProgress from '@/app/models/userProgress';
import Course from '@/app/models/course';
import User from '@/app/models/user';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Analytics Courses API called');
    
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
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }

    // Check if user is admin by looking up in database
    await connectMongoose();
    const user = await User.findById(session.user.id);
    
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

    console.log('✅ Admin user authenticated, proceeding with analytics...');

    // Get all courses
    const courses = await Course.find({});
    
    // Get all user progress data
    const allUserProgress = await UserProgress.find({});
    
    // Calculate course statistics
    const courseStats = courses.map(course => {
      const courseProgresses = allUserProgress.filter(up => 
        up.courses?.some(cp => cp.courseId?.toString() === course._id.toString())
      );
      
      const totalEnrollments = courseProgresses.length;
      const completedEnrollments = courseProgresses.filter(up => {
        const courseProgress = up.courses?.find(cp => cp.courseId?.toString() === course._id.toString());
        return courseProgress?.isCompleted || false;
      }).length;
      
      const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
      
      // Calculate average time to complete
      let totalTime = 0;
      let completedCount = 0;
      
      courseProgresses.forEach(up => {
        const courseProgress = up.courses?.find(cp => cp.courseId?.toString() === course._id.toString());
        if (courseProgress?.isCompleted && courseProgress.totalTimeSpent) {
          totalTime += courseProgress.totalTimeSpent;
          completedCount++;
        }
      });
      
      const averageTimeToComplete = completedCount > 0 ? totalTime / completedCount : 0;
      
      return {
        _id: course._id,
        title: course.title,
        totalEnrollments,
        completedEnrollments,
        completionRate,
        averageTimeToComplete,
        totalLessons: course.lessons?.length || 0,
      };
    });

    return NextResponse.json({
      courses: courseStats,
      totalCourses: courses.length,
      totalEnrollments: courseStats.reduce((sum, course) => sum + course.totalEnrollments, 0),
      totalCompletions: courseStats.reduce((sum, course) => sum + course.completedEnrollments, 0),
      averageCompletionRate: courseStats.length > 0 
        ? courseStats.reduce((sum, course) => sum + course.completionRate, 0) / courseStats.length 
        : 0,
    });

  } catch (error) {
    console.error('Error fetching course analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
