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
    
    if (!session?.user?.email && !(session?.user as any)?.phoneNumber) {
      console.log('❌ No session or user email/phone found');
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }

    // Check if user is admin
    await connectMongoose();
    let user = null;
    
    if (session.user.email) {
      user = await import('@/app/models/user').then(m => m.default.findOne({ email: session.user.email }));
    } else if ((session.user as any).phoneNumber) {
      user = await import('@/app/models/user').then(m => m.default.findOne({ phoneNumber: (session.user as any).phoneNumber }));
    }
    
    if (!user && session.user.id) {
      user = await import('@/app/models/user').then(m => m.default.findById(session.user.id));
    }
    
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
