import { NextResponse } from 'next/server';
import Course from '@/app/models/course';
import { safeConnectMongoose } from '@/lib/mongodb';
import { auth } from '@/auth';

// Force this route to be dynamic only (not executed during build)
export const dynamic = 'force-dynamic';

interface AdminUser {
  isAdmin?: boolean;
  [key: string]: any;
}

// Create a new course
export async function POST(req: Request) {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  const session = await auth();
  const user = session?.user as AdminUser;
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const connection = await safeConnectMongoose();
  if (!connection) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
  try {
    const data = await req.json();
    if (!data.title || !data.description || typeof data.price !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const course = await Course.create({
      title: data.title,
      description: data.description,
      price: data.price,
      thumbnailUrl: data.thumbnailUrl,
      lessons: data.lessons || [],
    });
    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create course', details: error?.message }, { status: 500 });
  }
}

// List all courses
export async function GET() {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  const connection = await safeConnectMongoose();
  if (!connection) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    return NextResponse.json(courses);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch courses', details: error?.message }, { status: 500 });
  }
} 