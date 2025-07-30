import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { safeConnectMongoose } from '@/lib/mongodb';
import User from '@/app/models/user';

// Force this route to be dynamic only (not executed during build)
export const dynamic = 'force-dynamic';

export async function GET() {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ 
        message: "No session found",
        session: null 
      });
    }

    const connection = await safeConnectMongoose();
    if (!connection) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    
    // Get the actual user from database
    const dbUser = await User.findById(session.user.id);
    
    return NextResponse.json({
      message: "Session debug info",
      session: {
        user: session.user,
        expires: session.expires
      },
      databaseUser: dbUser ? {
        _id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email,
        phoneNumber: dbUser.phoneNumber,
        isAdmin: dbUser.isAdmin
      } : null,
      sessionUserId: session.user.id,
      dbUserId: dbUser?._id
    });
  } catch (error) {
    console.error('Debug session error:', error);
    return NextResponse.json({ 
      message: "Error getting session",
      error: error.message 
    }, { status: 500 });
  }
} 