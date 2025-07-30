import { NextResponse } from 'next/server';
import Course from '@/app/models/course';
import { safeConnectMongoose } from '@/lib/mongodb';
import { Types } from 'mongoose';

// Force this route to be dynamic only (not executed during build)
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ courseId: string, lessonIdx: string }> }) {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  const { courseId, lessonIdx } = await params;
  if (!courseId || !Types.ObjectId.isValid(courseId)) {
    return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
  }
  const idx = parseInt(lessonIdx, 10);
  if (isNaN(idx) || idx < 0) {
    return NextResponse.json({ error: 'Invalid lesson index' }, { status: 400 });
  }
  const connection = await safeConnectMongoose();
  if (!connection) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    if (!course.lessons || !course.lessons[idx]) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    return NextResponse.json(course.lessons[idx]);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch lesson', details: error?.message }, { status: 500 });
  }
} 