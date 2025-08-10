import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing authentication endpoint');
    
    // Log all headers
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
    
    return NextResponse.json({
      success: true,
      session: session,
      user: session?.user || null,
      headers: headers,
      cookies: request.headers.get('cookie'),
    });
  } catch (error) {
    console.error('Error in test-auth:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
