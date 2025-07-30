import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectMongoose } from '@/lib/mongodb';
import User from '@/app/models/user';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ 
        message: "No session found",
        session: null 
      });
    }

    await connectMongoose();
    
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