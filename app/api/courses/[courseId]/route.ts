import { NextResponse } from 'next/server';
import Course from '@/app/models/course';
import { safeConnectMongoose } from '@/lib/mongodb';
import { auth } from '@/auth';
import { Types } from 'mongoose';

interface AdminUser {
  isAdmin?: boolean;
  [key: string]: any;
}

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

// Update a course (PATCH for partial updates)
export async function PATCH(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  const session = await auth();
  const user = session?.user as AdminUser;
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { courseId } = await params;
  if (!courseId || !Types.ObjectId.isValid(courseId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
  
  const connection = await safeConnectMongoose();
  if (!connection) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  try {
    const data = await req.json();
    console.log('📝 Updating course:', courseId, 'with data:', data);
    
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!updatedCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    console.log('✅ Course updated successfully:', updatedCourse.title);
    return NextResponse.json(updatedCourse);
  } catch (error: any) {
    console.error('❌ Error updating course:', error);
    return NextResponse.json({ error: 'Failed to update course', details: error?.message }, { status: 500 });
  }
} 