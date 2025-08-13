import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectMongoose } from '@/lib/mongodb';
import User from '@/app/models/user';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Session API called');
    
    const session = await auth();
    console.log('📋 Session data:', {
      exists: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: (session.user as any).name,
        isAdmin: (session.user as any).isAdmin
      } : 'no user'
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'No session or user ID found',
        session: session
      }, { status: 401 });
    }

    // Check if user exists in database
    await connectMongoose();
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found in database',
        sessionUserId: session.user.id
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.user.id,
        email: session.user.email,
        name: (session.user as any).name,
        isAdmin: (session.user as any).isAdmin
      },
      databaseUser: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Error in debug session:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 