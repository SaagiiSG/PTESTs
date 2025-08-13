import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectMongoose } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Tests API called');
    
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
      console.log('❌ No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }

    // Check if user is admin by looking up in database
    await connectMongoose();
    const User = (await import('@/app/models/user')).default;
    const user = await User.findById(session.user.id);
    
    if (!user?.isAdmin) {
      console.log('❌ User not found or not admin');
      return NextResponse.json({ error: 'Forbidden - Not admin' }, { status: 403 });
    }

    console.log('✅ Admin user authenticated, proceeding with tests count...');

    // Check if mongoose is connected
    if (!mongoose.connection.db) {
      console.log('❌ MongoDB not connected');
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    // Get tests collection and count
    const testsCollection = mongoose.connection.db.collection('tests');
    const totalTests = await testsCollection.countDocuments({});
    
    console.log(`✅ Found ${totalTests} tests in database`);

    return NextResponse.json({
      totalTests,
      success: true
    });

  } catch (error) {
    console.error('❌ Error fetching tests count:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
