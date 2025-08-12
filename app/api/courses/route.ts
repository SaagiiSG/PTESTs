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
    console.log('📥 Received course data:', data);
    
    if (!data.title || !data.description || typeof data.price !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const courseData = {
      title: data.title,
      description: data.description,
      price: data.price,
      thumbnailUrl: data.thumbnailUrl || '',
      lessons: data.lessons || [],
    };
    
    console.log('💾 Saving course data:', courseData);
    
    const course = await Course.create(courseData);
    console.log('✅ Course created:', course);
    
    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    console.error('❌ Course creation error:', error);
    return NextResponse.json({ error: 'Failed to create course', details: error?.message }, { status: 500 });
  }
}

// List all courses
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
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    let query = {};
    if (status === 'active') {
      // Include courses with status 'active' OR courses without status field (treat as active)
      query = { 
        $or: [
          { status: 'active' },
          { status: { $exists: false } }
        ]
      };
    } else if (status === 'inactive') {
      query = { status: 'inactive' };
    }
    // If no status filter, return all courses (for admin use)
    
    const courses = await Course.find(query).sort({ createdAt: -1 });
    console.log(`📚 Found ${courses.length} courses with query:`, JSON.stringify(query));
    return NextResponse.json(courses);
  } catch (error: any) {
    console.error('❌ Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses', details: error?.message }, { status: 500 });
  }
} 