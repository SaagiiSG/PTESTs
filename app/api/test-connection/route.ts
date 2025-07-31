import { NextResponse } from 'next/server';
import { safeConnectMongoose, isConnected, getConnectionStatus } from '@/lib/mongodb';

// Force this route to be dynamic only (not executed during build)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    
    // Test connection
    const connection = await safeConnectMongoose();
    
    if (!connection) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        details: 'Connection returned null'
      }, { status: 500 });
    }
    
    // Check connection status
    const connected = isConnected();
    const status = getConnectionStatus();
    
    console.log('✅ MongoDB connection test completed');
    
    return NextResponse.json({
      status: 'success',
      message: 'MongoDB connection successful',
      connected,
      connectionStatus: status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ MongoDB connection test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 