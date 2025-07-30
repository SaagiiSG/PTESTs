import { NextResponse } from 'next/server';
import Course from '@/app/models/course';
import { safeConnectMongoose } from '@/lib/mongodb';
import { Types } from 'mongoose';

// Force this route to be dynamic only (not executed during build)
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  const { courseId } = await params;
  if (!courseId || !Types.ObjectId.isValid(courseId)) {
    return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
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
    return NextResponse.json(course);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch course', details: error?.message }, { status: 500 });
  }
} 