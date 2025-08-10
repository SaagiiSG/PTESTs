import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('Session check endpoint called');
    
    // Log all headers for debugging
    const headers = Object.fromEntries(request.headers.entries());
    console.log('All headers:', headers);
    
    // Try to get session
    let session;
    try {
      session = await auth();
      console.log('Session from auth():', session);
    } catch (error) {
      console.log('Error getting session from auth():', error);
      session = null;
    }
    
    // Check if we have a valid session
    if (session?.user?.email) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          email: session.user.email,
          name: session.user.name,
          id: session.user.id,
        },
        session: session,
      });
    } else {
      return NextResponse.json({
        success: true,
        authenticated: false,
        session: session,
        headers: headers,
        cookies: request.headers.get('cookie'),
        suggestion: 'No valid session found - user may need to log in again',
      });
    }
  } catch (error) {
    console.error('Error in session-check:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
