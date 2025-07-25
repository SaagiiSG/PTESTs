import { NextResponse } from 'next/server';
import Course from '@/app/models/course';
import { connectMongoose } from '@/lib/mongodb';
import { Types } from 'mongoose';

export async function GET(req: Request, context: { params: { courseId: string, lessonIdx: string } }) {
  const params = await context.params;
  const { courseId, lessonIdx } = params;
  if (!courseId || !Types.ObjectId.isValid(courseId)) {
    return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
  }
  const idx = parseInt(lessonIdx, 10);
  if (isNaN(idx) || idx < 0) {
    return NextResponse.json({ error: 'Invalid lesson index' }, { status: 400 });
  }
  await connectMongoose();
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