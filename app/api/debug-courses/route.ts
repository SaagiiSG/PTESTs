import { NextResponse } from 'next/server';
import Course from '@/app/models/course';
import { safeConnectMongoose } from '@/lib/mongodb';

// Force this route to be dynamic only (not executed during build)
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  const connection = await safeConnectMongoose();
  if (!connection) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  try {
    // Get all courses without any filtering
    const allCourses = await Course.find({}).sort({ createdAt: -1 });
    
    // Get courses with status field
    const coursesWithStatus = await Course.find({ status: { $exists: true } });
    
    // Get courses without status field
    const coursesWithoutStatus = await Course.find({ status: { $exists: false } });
    
    // Get active courses
    const activeCourses = await Course.find({ status: 'active' });
    
    // Get inactive courses
    const inactiveCourses = await Course.find({ status: 'inactive' });

    const debugInfo = {
      totalCourses: allCourses.length,
      coursesWithStatus: coursesWithStatus.length,
      coursesWithoutStatus: coursesWithoutStatus.length,
      activeCourses: activeCourses.length,
      inactiveCourses: inactiveCourses.length,
      allCourses: allCourses.map(course => ({
        _id: course._id,
        title: course.title,
        status: course.status,
        hasStatus: 'status' in course,
        createdAt: course.createdAt
      }))
    };

    console.log('🔍 Debug courses info:', debugInfo);
    return NextResponse.json(debugInfo);
  } catch (error: any) {
    console.error('❌ Error debugging courses:', error);
    return NextResponse.json({ error: 'Failed to debug courses', details: error?.message }, { status: 500 });
  }
}
