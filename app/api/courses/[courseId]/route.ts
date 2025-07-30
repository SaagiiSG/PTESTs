import { NextResponse } from 'next/server';
import Course from '@/app/models/course';
import { connectMongoose } from '@/lib/mongodb';
import { Types } from 'mongoose';

export async function GET(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  if (!courseId || !Types.ObjectId.isValid(courseId)) {
    return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
  }
  await connectMongoose();
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