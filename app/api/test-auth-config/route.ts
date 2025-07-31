
import { NextResponse } from 'next/server';

// Force this route to be dynamic only (not executed during build)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 Testing NextAuth configuration...');
    
    // Check environment variables
    const config = {
      AUTH_SECRET: process.env.AUTH_SECRET ? '✅ Set' : '❌ Missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing',
      MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
    };
    
    console.log('📋 Environment variables status:', config);
    
    // Check if required variables are missing (AUTH_SECRET or NEXTAUTH_SECRET is required)
    const hasSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    const missingVars = Object.entries(config)
      .filter(([key, status]) => {
        if (key === 'AUTH_SECRET' || key === 'NEXTAUTH_SECRET') return false; // Skip these, we check separately
        return status === '❌ Missing';
      })
      .map(([key]) => key);
    
    if (!hasSecret) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing required AUTH_SECRET or NEXTAUTH_SECRET environment variable',
        missing: ['AUTH_SECRET or NEXTAUTH_SECRET'],
        config,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    if (missingVars.length > 0) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing required environment variables',
        missing: missingVars,
        config,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    console.log('✅ NextAuth configuration test completed');
    
    return NextResponse.json({
      status: 'success',
      message: 'NextAuth configuration is valid',
      config,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ NextAuth configuration test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Configuration test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 